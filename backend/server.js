import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

dotenv.config();
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

// Middleware Imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- SECURITY MIDDLEWARE ---

// 1. Set Security Headers
app.use(helmet());

// 2. CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow Vite frontend on both ports
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // Allow cookies/auth headers if needed
}));

// 3. Prevent Brute Force (Limit: 100 requests per 10 mins)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again after 10 minutes'
});
app.use('/api', limiter);

// 4. Body Parser (with increased limit for images)
app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ extended: true }));

// --- STATIC FILES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/volunteer-resume', volunteerResumeRoutes);
app.use('/api/preferences', userPreferencesRoutes);
app.use('/api/geofence', geofenceRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/college-settings', collegeSettingsRoutes);
app.use('/api/discussions', discussionRoutes);

app.get('/', (req, res) => {
  res.send('VMS API is Secure & Running...');
});

// --- ERROR HANDLING ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));