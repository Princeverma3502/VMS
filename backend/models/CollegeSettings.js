import mongoose from 'mongoose';

const collegeSettingsSchema = new mongoose.Schema(
  {
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true,
      unique: true,
    },
    // White-Label Theming
    primaryColor: {
      type: String,
      default: '#3B82F6',
      description: 'Primary brand color (hex)',
    },
    secondaryColor: {
      type: String,
      default: '#10B981',
      description: 'Secondary brand color (hex)',
    },
    accentColor: {
      type: String,
      default: '#F59E0B',
      description: 'Accent color for highlights',
    },
    logoUrl: {
      type: String,
      description: 'College logo URL (Cloudinary)',
    },
    bannerUrl: {
      type: String,
      description: 'College banner image for dashboard hero',
    },
    darkModeEnabled: {
      type: Boolean,
      default: true,
      description: 'Allow dark mode toggle',
    },
    brandName: {
      type: String,
      description: 'Display name for college (custom branding)',
    },
    footerText: {
      type: String,
      description: 'Custom footer text for all pages',
    },
    
    // API & Webhooks Configuration
    webhookUrl: {
      type: String,
      description: 'External URL to receive event data',
    },
    
    // ID Card Configuration
    idCardOptions: {
      templateId: { type: String, default: 'executive-pro' },
      orgName: { type: String, default: 'NATIONAL SERVICE SCHEME' },
      subHeader: { type: String, default: 'Your College Name' },
      collegeLogo: { type: String, default: '' }, // Stores Base64 or URL
      councilLogo: { type: String, default: '' },
      signatureUrl: { type: String, default: '' },
      signatureName: { type: String, default: 'Auth Signatory' },
      signatureRole: { type: String, default: 'Program Officer' },
      roleColors: {
        type: Map,
        of: String,
        default: {
          'Secretary': '#FFD700',
          'Domain Head': '#7c3aed',
          'Associate Head': '#10b981',
          'Volunteer': '#1d4ed8'
        }
      },
      visibleFields: {
        photo: { type: Boolean, default: true },
        rollNumber: { type: Boolean, default: true },
        bloodGroup: { type: Boolean, default: true },
        year: { type: Boolean, default: true },
        branch: { type: Boolean, default: true },
        role: { type: Boolean, default: true }
      }
    }
  },
  { timestamps: true }
);

// Middleware: Ensure college exists before saving
collegeSettingsSchema.pre('save', async function (next) {
  try {
    const College = mongoose.model('College');
    const college = await College.findById(this.collegeId);
    if (!college) {
      throw new Error('College does not exist');
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('CollegeSettings', collegeSettingsSchema);