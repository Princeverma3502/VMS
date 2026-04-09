import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import ngoRoutes from './routes/ngoRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import knowledgeBaseRoutes from './routes/knowledgeBaseRoutes.js';
import volunteerResumeRoutes from './routes/volunteerResumeRoutes.js';
import userPreferencesRoutes from './routes/userPreferencesRoutes.js';
import apiKeyRoutes from './routes/apiKeyRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import geofenceRoutes from './routes/geofenceRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import collegeRoutes from './routes/collegeRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import impactRoutes from './routes/impactRoutes.js';
import collegeSettingsRoutes from './routes/collegeSettingsRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import skillEndorsementRoutes from './routes/skillEndorsementRoutes.js';
import demoCertificateRoutes from './routes/demoCertificateRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Middleware Imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// --- VALIDATE ENVIRONMENT VARIABLES ---
const requiredEnvVars = [
  'MONGO_URI', 'JWT_SECRET', 'ADMIN_SECRET',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing: ${missingVars.join(', ')}`);
  process.exit(1);
}

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// ✅ CRITICAL FOR RENDER: Trust Proxy
app.set('trust proxy', 1);

// --- SECURITY MIDDLEWARE ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://vms-nss.vercel.app", "https://vms-6qfs.onrender.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.cloudinary.com"],
      connectSrc: ["'self'", "https://vms-6qfs.onrender.com", "http://localhost:5000", "ws://localhost:5173"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
}
app.disable('x-powered-by');

// --- CORS ---
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'https://vms-nss.vercel.app', // ✅ Your current production frontend
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    const isVercelPreview = origin.includes('.vercel.app');
    
    if (allowedOrigins.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
};
app.use(cors(corsOptions));

// --- RATE LIMITING ---
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3000, // Optimized for high concurrent student usage
});
app.use('/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ALL ROUTES PRESERVED ---
app.use('/auth', authLimiter, authRoutes);
app.use('/ngos', ngoRoutes);
app.use('/domains', domainRoutes);
app.use('/events', eventRoutes);
app.use('/game', gameRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes); 
app.use('/ai', aiRoutes);
app.use('/audit', auditRoutes);
app.use('/announcements', announcementRoutes);
app.use('/meetings', meetingRoutes);
app.use('/polls', pollRoutes);
app.use('/activity', activityRoutes);
app.use('/notices', noticeRoutes);
app.use('/knowledge-base', knowledgeBaseRoutes);
app.use('/volunteer-resume', volunteerResumeRoutes);
app.use('/preferences', userPreferencesRoutes);
app.use('/geofence', geofenceRoutes);
app.use('/sessions', sessionRoutes);
app.use('/colleges', collegeRoutes);
app.use('/keys', apiKeyRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/super-admin', superAdminRoutes);
app.use('/resumes', resumeRoutes);
app.use('/impact', impactRoutes);
app.use('/college-settings', collegeSettingsRoutes);
app.use('/discussions', discussionRoutes);
app.use('/skill-endorsements', skillEndorsementRoutes);
app.use('/demo-certificates', demoCertificateRoutes);
app.use('/analytics', analyticsRoutes);

app.get('/', (req, res) => res.send('VMS API is Secure & Running...'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));