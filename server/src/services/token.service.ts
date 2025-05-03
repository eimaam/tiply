import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/User';
import { JwtPayload } from '../types/user.types';
import { JWT } from '../config/env.config';


export class TokenService {
    // Access token options
    static ACCESS_TOKEN_EXPIRY = '30m'; // Short-lived access token (30 minutes)
    static REFRESH_TOKEN_EXPIRY = '7d'; // Longer-lived refresh token (7 days)

    /**
     * Generates a JWT token with the given payload and secret.
     * @param payload - The payload to include in the token.
     * @param secret - The secret key to sign the token.
     * @param expiresIn - The expiration time of the token.
     * @returns The generated JWT token.
     */
    static generateToken(payload: object, secret: string, expiresIn: string | number): string {
        const options: SignOptions = { expiresIn: expiresIn as number };
        return jwt.sign(payload, secret, options);
    }

    /**
     * Generate an access token for a user
     * @param userId - The ID of the user
     * @param email - The email of the user
     * @param role - The role of the user
     * @param permissions - The permissions of the user
     * @returns The generated access token
     */
    static generateAccessToken(
        userId: string,
        email: string,
        role: string,
        permissions: string[]
    ): string {
        const payload: JwtPayload = {
            userId,
            email,
            role: role as any,
            permissions,
            tokenType: 'access',
        };
        return this.generateToken(payload, JWT.SECRET, this.ACCESS_TOKEN_EXPIRY);
    }

    /**
     * Generate a refresh token for a user and store its hash in the database
     * @param userId - The ID of the user
     * @param email - The email of the user
     * @returns The generated refresh token
     */
    static async generateRefreshToken(userId: string, email: string): Promise<string> {
        // Generate refresh token with minimal payload (just enough to identify the user)
        const payload: Partial<JwtPayload> = {
            userId,
            email,
            tokenType: 'refresh'
        };
        
        const refreshToken = this.generateToken(payload, JWT.REFRESH_SECRET || JWT.SECRET, this.REFRESH_TOKEN_EXPIRY);
        
        // Hash the token before storing it to enhance security
        const salt = await bcrypt.genSalt(10);
        const hashedToken = await bcrypt.hash(refreshToken, salt);
        
        // Calculate expiry date for this token
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
        
        // Store hashed token in user document
        await UserModel.findByIdAndUpdate(userId, {
            $push: {
                refreshTokens: hashedToken,
                refreshTokensExpiry: expiryDate
            }
        });
        
        return refreshToken;
    }
    
    /**
     * Verify a refresh token and generate a new access token
     * @param refreshToken - The refresh token to verify
     * @returns New access token or null if refresh token is invalid
     */
    static async verifyRefreshToken(refreshToken: string): Promise<{ accessToken: string, user: any } | null> {
        try {
            // Verify the refresh token
            const decoded = jwt.verify(refreshToken, JWT.REFRESH_SECRET || JWT.SECRET) as JwtPayload;
            
            if (decoded.tokenType !== 'refresh') {
                throw new Error('Invalid token type');
            }
            
            // Find the user
            const user = await UserModel.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            // Check if refresh token is still valid (exists in user's refreshTokens)
            let isTokenValid = false;
            
            // Check each stored token hash
            for (let i = 0; i < (user.refreshTokens?.length || 0); i++) {
                const tokenHash = user.refreshTokens?.[i];
                const tokenExpiry = user.refreshTokensExpiry?.[i];
                
                // Skip expired tokens
                if (tokenExpiry && tokenExpiry < new Date()) {
                    continue;
                }
                
                // Compare the provided token with the stored hash
                if (tokenHash) {
                    const match = await bcrypt.compare(refreshToken, tokenHash);
                    if (match) {
                        isTokenValid = true;
                        break;
                    }
                }
            }
            
            if (!isTokenValid) {
                throw new Error('Refresh token is invalid or has been revoked');
            }
            
            // Generate new access token
            const accessToken = this.generateAccessToken(
                user._id.toString(),
                user.email,
                user.role,
                user.permissions
            );
            
            // Return new access token
            return {
                accessToken,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions
                }
            };
        } catch (error) {
            console.error('Refresh token verification failed:', error);
            return null;
        }
    }

    /**
     * Revoke a refresh token
     * @param userId - The ID of the user
     * @param refreshToken - The refresh token to revoke
     */
    static async revokeRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const user = await UserModel.findById(userId);
        if (!user || !user.refreshTokens) return;
        
        // Find and remove the specific token
        for (let i = 0; i < user.refreshTokens.length; i++) {
            const tokenHash = user.refreshTokens[i];
            
            // Compare the provided token with the stored hash
            const match = await bcrypt.compare(refreshToken, tokenHash);
            if (match) {
                // Remove this token and its expiry by index
                user.refreshTokens.splice(i, 1);
                if (user.refreshTokensExpiry && user.refreshTokensExpiry[i]) {
                    user.refreshTokensExpiry.splice(i, 1);
                }
                
                await user.save();
                return;
            }
        }
    }
    
    /**
     * Clean up expired refresh tokens for a user
     * @param userId - The ID of the user
     */
    static async cleanupExpiredTokens(userId: string): Promise<void> {
        const user = await UserModel.findById(userId);
        if (!user || !user.refreshTokens || !user.refreshTokensExpiry) return;
        
        const now = new Date();
        const validTokens: string[] = [];
        const validExpiries: Date[] = [];
        
        // Keep only non-expired tokens
        for (let i = 0; i < user.refreshTokens.length; i++) {
            const expiry = user.refreshTokensExpiry[i];
            
            if (expiry && expiry > now) {
                validTokens.push(user.refreshTokens[i]);
                validExpiries.push(expiry);
            }
        }
        
        // Update user document if any tokens were removed
        if (validTokens.length < user.refreshTokens.length) {
            user.refreshTokens = validTokens;
            user.refreshTokensExpiry = validExpiries;
            await user.save();
        }
    }

    /**
     * Generate password reset token
     * @param userId - The ID of the user for whom the token is generated.
     * @param secret - The secret key to sign the token.
     * @param expiresIn - The expiration time of the token.
     * @returns The generated password reset token.
     */
    static async generatePasswordResetToken(userId: string, secret: string, expiresIn: string): Promise<string> {
        const token = uuidv4();
        const passwordResetToken = token;
        const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        try {
            await UserModel.findByIdAndUpdate(userId, {
                passwordResetToken,
                passwordResetExpires,
            });
            return passwordResetToken?.toString();
            
        } catch (error) {
            console.error("Error generating password reset token:", error);
            throw new Error("Unable to generate password reset token");
        }
    }

}