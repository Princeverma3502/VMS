import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import { jest as _jest } from '@jest/globals';

dotenv.config();

// Create express app using same middleware/routes as server.js but without starting the listener
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';

import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
app.use(express.json());

// Use routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/tasks', taskRoutes);
app.use('/announcements', announcementRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
