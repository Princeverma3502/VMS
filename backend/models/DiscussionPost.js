import mongoose from 'mongoose';

const discussionPostSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  // For threading replies
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscussionPost',
    default: null,
  },
}, { timestamps: true });

const DiscussionPost = mongoose.model('DiscussionPost', discussionPostSchema);

export default DiscussionPost;
