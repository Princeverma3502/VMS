import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  
  // Sparse allows multiple users to have 'null' rollNumber, but enforces uniqueness if it exists
  rollNumber: { type: String, unique: true, sparse: true },
  
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', index: true },
  
  branch: { type: String }, 
  year: { type: String },

  role: {
    type: String,
    enum: ['Secretary', 'Domain Head', 'Associate Head', 'Volunteer', 'admin'],
    default: 'Volunteer',
    required: true,
    index: true 
  },

  isSuperAdmin: {
    type: Boolean,
    default: false,
    description: 'God-mode access to super-admin dashboard',
    index: true,
  },

  profileImage: {
    type: String,
    default: "" // Stores the URL of the uploaded image
  },

  isApproved: {
    type: Boolean,
    default: false,
    index: true
  },

  gamification: {
    xpPoints: { type: Number, default: 0 }, 
    lifetimeXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ name: String, iconUrl: String, earnedAt: Date }],
    // --- STREAK FIELDS ---
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

  academicYear: { type: String, default: '1st' },

  isActive: { type: Boolean, default: true, index: true },

  geolocationConsent: {
    type: Boolean,
    default: false,
  },

  endorsedSkills: [{
    type: String
  }],

  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    index: true
  },

  pushSubscription: { type: Object, default: null }
}, { timestamps: true });

// --- CRITICAL AUTHENTICATION LOGIC ---

// 1. Encrypt password before saving
// NOTE: We do NOT pass 'next' here to avoid conflicts with async/await in modern Mongoose
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); // Fixed: Added await
});

// 2. Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);