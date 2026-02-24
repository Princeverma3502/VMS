import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

dotenv.config();

// --- VALIDATE ENVIRONMENT VARIABLES ---
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'ADMIN_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file or environment configuration.');
  process.exit(1);
}

console.log('✓ All required environment variables are set');

connectDB();

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

// Middleware Imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- SECURITY MIDDLEWARE ---

// 1. Set Security Headers
app.use(helmet());

// 2. CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.vercel.app' 
    : ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. Prevent Brute Force (Limit: 100 requests per 10 mins)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/', limiter);

// 4. Body Parser (with increased limit for images)
app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ extended: true }));

// --- STATIC FILES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
app.use('/auth', authRoutes);
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

app.get('/', (req, res) => {
  res.send('VMS API is Secure & Running...');
});

// --- ERROR HANDLING ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));