import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Permission } from '../models/Permission';
import { UserModel, UserStatus } from '../models/User';
import { defaultPermissions, defaultPermissionSets } from './seed-data';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/database';

// Load environment variables
dotenv.config();

/**
 * Seed permissions
 */
const seedPermissions = async () => {
  try {
    console.log('🔑 Seeding permissions...');
    
    // Clear existing permissions if they exist
    const existingPermissions = await Permission.countDocuments();
    if (existingPermissions > 0) {
      console.log(`Found ${existingPermissions} existing permissions. Skipping permission seeding.`);
      
      // Return existing permissions for role assignment
      return await Permission.find();
    }
    
    // Create permissions
    const permissions = await Permission.insertMany(defaultPermissions);
    console.log(`✅ Successfully seeded ${permissions.length} permissions`);
    
    return permissions;
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
};

/**
 * Seed initial admin user
 */
const seedAdminUser = async (permissions: any[]) => {
  try {
    console.log('👤 Seeding admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await UserModel.findOne({ email: 'admin@tiply.com' });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping admin user seeding.');
      return existingAdmin;
    }
    
    // Create admin password (generate a strong random one in production)
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Create admin user with superAdmin permissions
    const adminUserData = {
      username: 'admin',
      email: 'admin@tiply.com',
      password: hashedPassword,
      displayName: 'System Admin',
      status: UserStatus.ACTIVE,
      emailVerified: true,
      isVerified: true,
      onboardingCompleted: true,
      permissions: defaultPermissionSets.superAdmin, // Assign all superAdmin permissions directly
    };

    const adminUser = await UserModel.create(adminUserData);
    
    console.log('✅ Successfully created admin user');
    console.log('👤 Admin Credentials:');
    console.log('   Email: admin@tiply.com');
    console.log(`   Password: ${adminPassword}`);
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
};

/**
 * Main seeder function
 */
const seedDatabase = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    // Seed permissions
    const permissions = await seedPermissions();
    
    // Seed admin user with direct permissions
    await seedAdminUser(permissions);
    
    console.log('✅ Database seeding completed successfully');
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();