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
      universityName: { type: String, default: 'NATIONAL SERVICE SCHEME' },
      collegeSubheading: { type: String, default: 'National Service Scheme' },
      subHeader: { type: String, default: 'Indian Institute of Technology, Bombay' },
      collegeLogo: { type: String, default: '' }, // Stores Base64 or URL
      councilLogo: { type: String, default: '' },
      
      // Officers & Validity
      officerName: { type: String, default: 'Dr. R. K. Singh' },
      officerSig: { type: String, default: '' },
      validThru: { type: String, default: 'DEC 2026' },

      // Legacy Individual Secretary Fields (Kept for backwards compatibility with Customizer)
      secretaryName: { type: String, default: 'A. S. Patel' },
      secretarySig: { type: String, default: '' },
      secretary2Name: { type: String, default: '' },
      secretary2Sig: { type: String, default: '' },
      secretary3Name: { type: String, default: '' },
      secretary3Sig: { type: String, default: '' },

      // Array format for student secretaries
      studentSecretaries: {
        type: [
          {
            name: { type: String, default: '' },
            signature: { type: String, default: '' }, // Changed from signatureUrl to match frontend
            designation: { type: String, default: 'Student Secretary' }
          }
        ],
        default: []
      },
      
      // Role-Based Branding Colors
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
// Fixed 'next is not a function' by defining it and wrapping in try/catch
collegeSettingsSchema.pre('save', async function (next) {
  try {
    const College = mongoose.model('College');
    const college = await College.findById(this.collegeId);
    
    if (!college) {
      return next(new Error('College does not exist'));
    }
    
    next(); // Move on to save the document
  } catch (error) {
    next(error); // Pass any errors correctly to Mongoose
  }
});

export default mongoose.model('CollegeSettings', collegeSettingsSchema);