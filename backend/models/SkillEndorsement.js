import mongoose from 'mongoose';

const skillEndorsementSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    endorsedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'Volunteer being endorsed',
    },
    endorsedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'Domain Head or Admin endorsing',
    },
    skillName: {
      type: String,
      enum: [
        'Public Speaking',
        'Leadership',
        'Problem Solving',
        'Teamwork',
        'Logistics',
        'Event Management',
        'Communication',
        'Critical Thinking',
        'Empathy',
        'Technical Skills',
        'Data Analysis',
        'Project Management',
      ],
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      description: 'Event where skill was demonstrated (optional)',
    },
    endorsementNote: {
      type: String,
      maxlength: 500,
      description: 'Why this skill is being endorsed',
    },
    visibility: {
      type: String,
      enum: ['private', 'college', 'public'],
      default: 'college',
      description: 'Who can see this endorsement',
    },
    isVerified: {
      type: Boolean,
      default: true,
      description: 'Verified by admin (always true when created by Domain Head)',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SkillEndorsement', skillEndorsementSchema);
