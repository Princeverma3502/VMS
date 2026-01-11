import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'nss-blue'],
      default: 'light',
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    notifications: {
      activityFeed: { type: Boolean, default: true },
      polls: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true },
      showStats: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true },
    },
    customColors: {
      primary: { type: String, default: '#3B82F6' },
      secondary: { type: String, default: '#1E40AF' },
      accent: { type: String, default: '#FBBF24' },
    },
    layout: {
      sidebarCollapsed: { type: Boolean, default: false },
      compactMode: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model('UserPreferences', userPreferencesSchema);
