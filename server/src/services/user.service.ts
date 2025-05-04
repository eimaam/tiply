import { UserModel } from "../models/User";

export class UserService {
  /**
   * Fetches a user by their ID
   * @param userId - The ID of the user to retrieve
   * @param options - Optional query parameters
   * @param options.populate - Fields to populate (e.g., ['profiles', 'other'])
   * @returns The user object if found, otherwise null
   */
  static async getUserById(userId: string, options?: { populate?: string[] }) {
    try {
      let query = UserModel.findById(userId).select(
        "-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires"
      );

      // Handle population based on options
      if (options?.populate) {
        for (const field of options.populate) {
          query = query.populate(field);
        }
      }

      return await query;
    } catch (error: any) {
      console.error("🔍 Error fetching user by ID:", error);
      throw new Error("Unable to fetch user");
    }
  }

  /**
   * get user via their registered email address
   * @param email - The email address of the user to retrieve
   * @param options - Optional query parameters
   * @param options.populate - Fields to populate (e.g., ['profiles', 'other'])
   * @returns The user object if found, otherwise null
   */
  static async getUserByEmail(
    email: string,
    options?: { populate?: string[] }
  ) {
    try {
      let query = UserModel.findOne({
        email: { $regex: new RegExp(`^${email}$`, `i`) },
      }).select(
        "-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires"
      );

      // Handle population based on options
      if (options?.populate) {
        for (const field of options.populate) {
          query = query.populate(field);
        }
      }

      return await query;
    } catch (error: any) {
      console.error("📧 Error fetching user by email:", error);
      throw new Error("Unable to fetch user");
    }
  }

  /**
   * Fetches a user by their username
   * @param username - The username of the user to retrieve
   * @param options - Optional query parameters
   * @param options.populate - Fields to populate (e.g., ['profiles', 'other'])
   * @returns The user object if found, otherwise null
   */
  static async getUserByUsername(
    username: string,
    options?: { populate?: string[] }
  ) {
    try {
      let query = UserModel.findOne({
        username: { $regex: new RegExp(`^${username}$`, `i`) },
      }).select(
        "-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires"
      );

      // Handle population based on options
      if (options?.populate) {
        for (const field of options.populate) {
          query = query.populate(field);
        }
      }

      return await query;
    } catch (error: any) {
      console.error("🔍 Error fetching user by username:", error);
      throw new Error("Unable to fetch user");
    }
  }
}
