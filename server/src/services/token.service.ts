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
     * Generate a refresh token for a user, hash it, and calculate its expiry.
     * Does NOT save to the database.
     * @param userId - The ID of the user
     * @param email - The email of the user
     * @returns An object containing the refresh token value, its hash, and expiry date.
     */
    static async generateRefreshToken(userId: string, email: string): Promise<{ refreshToken: string, hashedToken: string, expiryDate: Date }> {
        // Generate refresh token with minimal payload
        const payload: Partial<JwtPayload> = {
            userId,
            email,
            tokenType: 'refresh'
        };
        
        const refreshToken = this.generateToken(payload, JWT.REFRESH_SECRET || JWT.SECRET, this.REFRESH_TOKEN_EXPIRY);
        
        // Hash the token
        const salt = await bcrypt.genSalt(10);
        const hashedToken = await bcrypt.hash(refreshToken, salt);
        
        // Calculate expiry date for this token (e.g., 7 days from now)
        const expiryDate = new Date();
        
        // For simplicity, using Date methods:
        const expiryDays = parseInt(this.REFRESH_TOKEN_EXPIRY.replace('d', ''), 10) || 7;
        expiryDate.setDate(expiryDate.getDate() + expiryDays); 
        
        return { refreshToken, hashedToken, expiryDate };
    }
    
    /**
     * Verify a refresh token, rotate it, and generate a new access token.
     * Handles saving the updated token state to the database.
     * @param refreshToken - The refresh token to verify
     * @returns New access token, refresh token and user data or null if refresh token is invalid
     */
    static async verifyRefreshToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string, user: any } | null> {
        try {
            // Verify the refresh token JWT signature and expiry
            const decoded = jwt.verify(refreshToken, JWT.REFRESH_SECRET || JWT.SECRET) as JwtPayload;
            
            if (decoded.tokenType !== 'refresh') {
                throw new Error('Invalid token type');
            }
            
            // Find the user
            const user = await UserModel.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            // Check if refresh token hash exists and is not expired in the DB
            let isTokenValidInDB = false;
            let tokenIndex = -1;
            
            if (user.refreshTokens && user.refreshTokensExpiry) {
                for (let i = 0; i < user.refreshTokens.length; i++) {
                    const tokenHash = user.refreshTokens[i];
                    const tokenExpiry = user.refreshTokensExpiry[i];
                    
                    // Skip if expiry is invalid or in the past
                    if (!tokenExpiry || tokenExpiry < new Date()) {
                        continue;
                    }
                    
                    // Compare the provided token with the stored hash
                    if (tokenHash) {
                        const match = await bcrypt.compare(refreshToken, tokenHash);
                        if (match) {
                            isTokenValidInDB = true;
                            tokenIndex = i;
                            break; // Found the valid token
                        }
                    }
                }
            }
            
            if (!isTokenValidInDB) {
                 // If token is not found or expired in DB, clean up potentially expired tokens for this user
                await this.cleanupExpiredTokens(user._id.toString());
                throw new Error('Refresh token is invalid, expired, or has been revoked');
            }
            
            // --- Token Rotation ---
            // 1. Remove the used token hash and expiry from the user object (in memory)
            if (tokenIndex !== -1) {
                user.refreshTokens?.splice(tokenIndex, 1);
                user.refreshTokensExpiry?.splice(tokenIndex, 1);
            }

            // 2. Generate new refresh token details (value, hash, expiry)
            const { 
                refreshToken: newRefreshTokenValue, 
                hashedToken: newHashedToken, 
                expiryDate: newExpiryDate 
            } = await this.generateRefreshToken(user._id.toString(), user.email);

            // 3. Add the new token hash and expiry to the user object (in memory)
            user.refreshTokens = user.refreshTokens || [];
            user.refreshTokensExpiry = user.refreshTokensExpiry || [];
            user.refreshTokens.push(newHashedToken);
            user.refreshTokensExpiry.push(newExpiryDate);
            
            // 4. Save the user document with the old token removed and the new one added
            await user.save(); 
            // Consider adding error handling around save

            // 5. Generate new access token
            const accessToken = this.generateAccessToken(
                user._id.toString(),
                user.email,
                user.role,
                user.permissions
            );
            
            // Return new access token, the *new* refresh token value, and user info
            return {
                accessToken,
                refreshToken: newRefreshTokenValue, // Return the new plaintext token
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions
                }
            };
        } catch (error: any) {
            console.error('❌ Refresh token verification failed:', error.message);
            // If JWT verification fails (expired/invalid signature), error.message will indicate that.
            // If DB check fails, the custom error message is thrown.
            return null; // Signal failure
        }
    }

    /**
     * Revoke a specific refresh token by removing its hash from the user's document.
     * @param userId - The ID of the user
     * @param refreshToken - The refresh token value to revoke
     */
    static async revokeRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const user = await UserModel.findById(userId);
        // Ensure arrays exist before proceeding
        if (!user || !user.refreshTokens || !user.refreshTokensExpiry) return;
        
        let tokenRemoved = false;
        const remainingTokens: string[] = [];
        const remainingExpiries: Date[] = [];

        for (let i = 0; i < user.refreshTokens.length; i++) {
            const tokenHash = user.refreshTokens[i];
            
            // Compare the provided token value with the stored hash
            const match = await bcrypt.compare(refreshToken, tokenHash);
            if (match) {
                // Don't include this token in the remaining arrays
                tokenRemoved = true;
            } else {
                // Keep this token and its expiry
                remainingTokens.push(tokenHash);
                if (user.refreshTokensExpiry[i]) { // Check if expiry exists at this index
                    remainingExpiries.push(user.refreshTokensExpiry[i]);
                } else {
                     // This case shouldn't happen if data is consistent, but handle defensively
                     console.warn(`⚠️ Missing expiry for token hash at index ${i} for user ${userId}`);
                     // Decide how to handle: remove token, keep with default expiry, etc.
                     // For now, let's keep it consistent and remove the token if expiry is missing
                }
            }
        }

        // If a token was identified and removed, update the user document
        if (tokenRemoved) {
            user.refreshTokens = remainingTokens;
            user.refreshTokensExpiry = remainingExpiries;
            try {
                await user.save();
                console.log(`🧹 Revoked refresh token for user ${userId}`);
            } catch (saveError) {
                console.error(`❌ Error saving user ${userId} after revoking token:`, saveError);
            }
        } else {
             console.log(`🤷 Refresh token to revoke not found for user ${userId}`);
        }
    }
    
    /**
     * Clean up expired refresh token hashes and their expiries for a user.
     * @param userId - The ID of the user
     */
    static async cleanupExpiredTokens(userId: string): Promise<void> {
        const user = await UserModel.findById(userId);
        // Ensure arrays exist
        if (!user || !user.refreshTokens || !user.refreshTokensExpiry) return;
        
        const now = new Date();
        const validTokens: string[] = [];
        const validExpiries: Date[] = [];
        let changed = false;
        
        // Keep only non-expired tokens
        for (let i = 0; i < user.refreshTokens.length; i++) {
            const expiry = user.refreshTokensExpiry[i];
            const tokenHash = user.refreshTokens[i]; // Get hash for logging if needed
            
            // Check if expiry exists and is in the future
            if (expiry && expiry > now) {
                validTokens.push(tokenHash);
                validExpiries.push(expiry);
            } else {
                // Mark that changes are needed
                changed = true;
                // console.log(`🧹 Found expired token hash for user ${userId}: ${tokenHash}`);
            }
        }
        
        // Update user document only if any tokens were removed
        if (changed) {
            user.refreshTokens = validTokens;
            user.refreshTokensExpiry = validExpiries;
            try {
                await user.save();
                console.log(`🧹 Cleaned up expired tokens for user ${userId}`);
            } catch (saveError) {
                console.error(`❌ Error saving user ${userId} after cleaning tokens:`, saveError);
            }
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