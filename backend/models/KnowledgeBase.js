import mongoose from 'mongoose';

const knowledgeBaseArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Getting Started', 'Guidelines', 'Procedures', 'FAQ', 'Orientation', 'Resources'],
      required: true,
    },
    icon: {
      type: String,
      default: 'HelpCircle',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: null,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
      },
    ],
    relatedArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeBase',
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    helpful: {
      yes: { type: Number, default: 0 },
      no: { type: Number, default: 0 },
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  { timestamps: true }
);

knowledgeBaseArticleSchema.index({ category: 1 });
knowledgeBaseArticleSchema.index({ tags: 1 });

export default mongoose.model('KnowledgeBase', knowledgeBaseArticleSchema);
