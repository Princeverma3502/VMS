import request from 'supertest';
import app from '../testApp.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import mongoose from 'mongoose';

let server;

beforeAll(async () => {
  await global.__MONGO_SETUP__;
  server = await app.listen(0);
});

afterAll(async () => {
  await server.close();
});

describe('Task workflow', () => {
  it('Secretary creates task; Volunteer claims, submits; Secretary verifies', async () => {
    // Create Secretary
    await request(server).post('/auth/register').send({
      name: 'Sec', email: 'sec2@example.com', password: 'password', role: 'Secretary', whatsappNumber: '999', year: '4th', branch: 'CS', adminSecret: process.env.ADMIN_SECRET
    });
    await User.updateOne({ email: 'sec2@example.com' }, { isApproved: true, collegeId: new mongoose.Types.ObjectId() });
    const loginSec = await request(server).post('/auth/login').send({ email: 'sec2@example.com', password: 'password' });
    const secToken = loginSec.body.token;

    // Secretary creates a task
    const taskRes = await request(server).post('/tasks').set('Authorization', `Bearer ${secToken}`).send({ title: 'T1', description: 'Do T1', deadline: new Date().toISOString() });
    expect(taskRes.status).toBe(201);
    const taskId = taskRes.body._id;

    // Create Volunteer
    await request(server).post('/auth/register').send({ name: 'Vol', email: 'vol@example.com', password: 'password', role: 'Volunteer', whatsappNumber: '999', year: '1st', branch: 'CS' });
    await User.updateOne({ email: 'vol@example.com' }, { isApproved: true, collegeId: taskRes.body.collegeId });
    const loginVol = await request(server).post('/auth/login').send({ email: 'vol@example.com', password: 'password' });
    const volToken = loginVol.body.token;

    // Volunteer claims task
    const claimRes = await request(server).put(`/tasks/${taskId}/claim`).set('Authorization', `Bearer ${volToken}`).send();
    expect(claimRes.status).toBe(200);

    // Volunteer submits task
    const submitRes = await request(server).put(`/tasks/${taskId}/submit`).set('Authorization', `Bearer ${volToken}`).send({ submissionData: 'done' });
    expect(submitRes.status).toBe(200);

    // Secretary verifies
    const verifyRes = await request(server).put(`/tasks/${taskId}/verify`).set('Authorization', `Bearer ${secToken}`).send();
    expect(verifyRes.status).toBe(200);
  }, 30000);
});
