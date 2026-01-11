import mongoose from 'mongoose';
import crypto from 'crypto';

const apiKeySchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      description: 'Secretary who generated the key',
    },
    name: {
      type: String,
      required: true,
      description: 'Human-readable name for the key (e.g., "CMS Integration")',
    },
    preview: {
      type: String,
      required: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      description: 'SHA-256 hash of the actual API key (we never store plaintext)',
    },
    // The actual key is shown only once on creation: `college-${collegeId}-${random()}`
    lastFourChars: {
      type: String,
      description: 'Last 4 characters of key for identification',
    },
    permissions: {
      type: [String],
      enum: ['read:tasks', 'read:users', 'write:tasks', 'read:sessions', 'webhook:manage'],
      default: ['read:tasks', 'read:users'],
      description: 'Scopes this key has access to',
    },
    rateLimit: {
      type: Number,
      default: 1000,
      description: 'Requests per hour',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastUsed: {
      type: Date,
      description: 'Timestamp of last API call using this key',
    },
    expiresAt: {
      type: Date,
      description: 'API key expiration date (optional)',
    },
    ipWhitelist: {
      type: [String],
      default: [],
      description: 'Restrict key to specific IPs',
    },
  },
  { timestamps: true }
);

// Static: Generate new API key
apiKeySchema.statics.generateKey = function (collegeId) {
  const randomPart = crypto.randomBytes(24).toString('hex');
  const plainKey = `college_${collegeId}_${randomPart}`;
  const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');
  const lastFourChars = plainKey.slice(-4);
  
  return {
    plainKey, // Show once to user
    keyHash,
    lastFourChars,
  };
};

// Static: Verify incoming API key
apiKeySchema.statics.verifyKey = async function (incomingKey) {
  const incomingHash = crypto.createHash('sha256').update(incomingKey).digest('hex');
  return await this.findOne({ keyHash: incomingHash, isActive: true });
};

export default mongoose.model('APIKey', apiKeySchema);
