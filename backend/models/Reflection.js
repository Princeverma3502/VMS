import mongoose from 'mongoose';

const reflectionSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'Volunteer writing reflection',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      description: 'Event this reflection is about',
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
      description: 'Reflection title',
    },
    content: {
      type: String,
      required: true,
      minlength: 50,
      description: 'Full reflection text (NSS diary entry)',
    },
    mood: {
      type: String,
      enum: ['inspired', 'grateful', 'humbled', 'empowered', 'reflective', 'hopeful'],
      default: 'grateful',
      description: 'Emotional tone of reflection',
    },
    impact: {
      type: String,
      enum: ['self', 'community', 'environment', 'all'],
      default: 'community',
      description: 'Type of impact reflected upon',
    },
    learnings: {
      type: [String],
      default: [],
      description: 'Key learnings extracted from reflection',
    },
    attachments: {
      type: [
        {
          url: String,
          type: String, // 'image' or 'document'
        },
      ],
      default: [],
      description: 'Optional media attachments',
    },
    isPrivate: {
      type: Boolean,
      default: true,
      description: 'Only user can see this reflection',
    },
    allowedViewers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      description: 'Users allowed to view if not private',
    },
    wordCount: {
      type: Number,
      description: 'Calculated word count',
    },
  },
  { timestamps: true }
);

// Pre-save: Calculate word count
reflectionSchema.pre('save', function (next) {
  this.wordCount = this.content.split(/\s+/).length;
  next();
});

export default mongoose.model('Reflection', reflectionSchema);
