import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import College from '../models/College.js';

dotenv.config();

const backfillData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Create a default college if it doesn't exist (for existing data)
    let defaultCollege = await College.findOne({ slug: 'default' });
    if (!defaultCollege) {
      defaultCollege = await College.create({
        name: 'Default Institution',
        slug: 'default',
        logoUrl: '',
        primaryColor: '#1d4ed8'
      });
      console.log('Created default college');
    }

    // Backfill all users without collegeId
    const result = await User.updateMany(
      { collegeId: { $exists: false } },
      { 
        $set: { 
          collegeId: defaultCollege._id,
          lifetimeXP: 0,
          academicYear: '1st',
          isActive: true
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} users with collegeId and default fields`);

    // For existing users with xpPoints, copy to lifetimeXP (if empty)
    const usersToMigrate = await User.find({ 
      'gamification.lifetimeXP': { $eq: 0 },
      'gamification.xpPoints': { $gt: 0 }
    });

    if (usersToMigrate.length > 0) {
      for (const user of usersToMigrate) {
        user.gamification.lifetimeXP = user.gamification.xpPoints;
        await user.save();
      }
      console.log(`Migrated lifetimeXP for ${usersToMigrate.length} users`);
    }

    console.log('Backfill complete');
    process.exit(0);
  } catch (error) {
    console.error('Backfill error:', error);
    process.exit(1);
  }
};

backfillData();
