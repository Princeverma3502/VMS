import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Routes (reuse existing route modules)
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

// error handlers
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Use process.cwd() / path.resolve() instead of import.meta for Jest compatibility
const __dirname = path.resolve();

const app = express();

// Security middleware (lighter for tests)
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use(cors());

const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 1000 });
app.use('/', limiter);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Static (tests may not need this but keep for parity)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
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
app.use('/analytics', analyticsRoutes);

app.get('/', (req, res) => res.send('Test VMS API'));

app.use(notFound);
app.use(errorHandler);

export default app;
