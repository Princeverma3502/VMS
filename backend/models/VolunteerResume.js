import mongoose from 'mongoose';

const volunteerResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    uniqueLink: {
      type: String,
      required: true,
      unique: true,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    totalXP: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    topSkills: [
      {
        name: String,
        icon: String,
        proficiency: {
          type: String,
          enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        },
        tasksCompleted: Number,
      },
    ],
    domainsContributed: [
      {
        domainId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Domain',
        },
        domainName: String,
        tasksCompleted: Number,
        hoursSpent: Number,
        percentage: Number,
      },
    ],
    eventsAttended: [
      {
        eventId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Event',
        },
        eventName: String,
        date: Date,
        hoursSpent: Number,
      },
    ],
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: Date,
        description: String,
      },
    ],
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    testimonials: [
      {
        author: String,
        text: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    downloadCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    certificateGenerated: {
      url: String,
      generatedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model('VolunteerResume', volunteerResumeSchema);
