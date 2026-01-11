import mongoose from 'mongoose';

const webhookLogSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['xp_earned', 'task_completed', 'event_attended', 'badge_earned'],
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      description: 'Full webhook payload sent to college endpoint',
    },
    webhookEndpoint: {
      type: String,
      required: true,
      description: 'The college\'s webhook receiver URL',
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'retrying'],
      default: 'pending',
      index: true,
    },
    httpStatusCode: {
      type: Number,
      description: 'HTTP response status from college endpoint',
    },
    responseBody: {
      type: String,
      description: 'Response from college\'s webhook receiver',
    },
    errorMessage: {
      type: String,
      description: 'Error details if failed',
    },
    retryCount: {
      type: Number,
      default: 0,
      max: 5,
      description: 'Number of retry attempts',
    },
    nextRetryAt: {
      type: Date,
      description: 'When to retry if failed (exponential backoff)',
    },
    sentAt: {
      type: Date,
      description: 'When the webhook was sent',
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      description: 'ID of the entity that triggered the webhook (Task, User, etc.)',
    },
  },
  { timestamps: true }
);

// Index for efficient retry queries
webhookLogSchema.index({ collegeId: 1, status: 1, nextRetryAt: 1 });

export default mongoose.model('WebhookLog', webhookLogSchema);
