import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropBadIndex = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const db = mongoose.connection.db;
    
    console.log('Dropping rollNumber_1 index from users collection...');
    try {
      await db.collection('users').dropIndex('rollNumber_1');
      console.log('✅ Successfully dropped rollNumber_1 index');
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log('⚠️ rollNumber_1 index not found (already dropped)');
      } else {
        throw error;
      }
    }

    console.log('Dropping all indexes and recreating...');
    await db.collection('users').dropIndexes();
    console.log('✅ Dropped all indexes');
    
    // Create new indexes from schema
    const User = mongoose.model('User', new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      whatsappNumber: { type: String, required: true },
      branch: { type: String },
      year: { type: String },
      role: {
        type: String,
        enum: ['Secretary', 'Domain Head', 'Associate Head', 'Volunteer'],
        default: 'Volunteer',
        required: true,
        index: true
      },
      profileImage: {
        type: String,
        default: ""
      },
      isApproved: {
        type: Boolean,
        default: false,
        index: true
      },
      gamification: {
        xpPoints: { type: Number, default: 0, index: -1 },
        level: { type: Number, default: 1 },
        badges: [{ name: String, iconUrl: String, earnedAt: Date }],
        streak: { type: Number, default: 1 },
        lastLogin: { type: Date, default: Date.now },
        totalHours: { type: Number, default: 0 },
        tasksCompleted: { type: Number, default: 0 },
        eventsAttended: { type: Number, default: 0 },
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'nss-blue'],
        default: 'light',
      },
      resumePublished: {
        type: Boolean,
        default: false,
      },
      geolocationConsent: {
        type: Boolean,
        default: false,
      },
      pushSubscription: { type: Object, default: null }
    }, { timestamps: true }));

    await User.syncIndexes();
    console.log('✅ Recreated indexes from schema');

    console.log('✅ Database fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

dropBadIndex();
