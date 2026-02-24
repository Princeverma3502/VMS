import request from 'supertest';
import app from '../testApp.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

let server;

beforeAll(async () => {
  await global.__MONGO_SETUP__;
  server = await app.listen(0);
});

afterAll(async () => {
  await server.close();
});

describe('Admin actions (Secretary)', () => {
  it('registers secretary, logs in and creates event/announcement/task', async () => {
    // Register Secretary
    const regRes = await request(server)
      .post('/auth/register')
      .send({
        name: 'Sec User',
        email: 'sec@example.com',
        password: 'password123',
        role: 'Secretary',
        whatsappNumber: '9999999999',
        year: '4th',
        branch: 'CS',
        adminSecret: process.env.ADMIN_SECRET
      });

    expect([201,200]).toContain(regRes.status);

    // Approve Secretary and assign a test collegeId
    const collegeId = new mongoose.Types.ObjectId();
    await User.updateOne({ email: 'sec@example.com' }, { isApproved: true, collegeId });

    // Login
    const login = await request(server)
      .post('/auth/login')
      .send({ email: 'sec@example.com', password: 'password123' });

    expect(login.status).toBe(200);
    const token = login.body.token;
    expect(token).toBeDefined();

    // Create Event
    const eventRes = await request(server)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Event', date: new Date().toISOString(), type: 'Workshop' });

    expect(eventRes.status).toBe(201);

    // Create Global Announcement
    const annRes = await request(server)
      .post('/announcements')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Global Notice', content: 'Hello all', scope: 'Global' });

    expect(annRes.status).toBe(201);

    // Create Task
    const taskRes = await request(server)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Sample Task', description: 'Do something', deadline: new Date().toISOString() });

    expect(taskRes.status).toBe(201);
  }, 20000);
});
