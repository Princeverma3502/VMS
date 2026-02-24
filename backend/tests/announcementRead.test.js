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

describe('Announcement read flow', () => {
  it('Secretary creates global announcement; Volunteer retrieves and marks read', async () => {
    // Secretary
    await request(server).post('/auth/register').send({ name: 'SecA', email: 'seca@example.com', password: 'password', role: 'Secretary', whatsappNumber: '999', year: '4th', branch: 'CS', adminSecret: process.env.ADMIN_SECRET });
    await User.updateOne({ email: 'seca@example.com' }, { isApproved: true, collegeId: new mongoose.Types.ObjectId() });
    const loginSec = await request(server).post('/auth/login').send({ email: 'seca@example.com', password: 'password' });
    const secToken = loginSec.body.token;

    const ann = await request(server).post('/announcements').set('Authorization', `Bearer ${secToken}`).send({ title: 'Hello', content: 'World', scope: 'Global' });
    expect(ann.status).toBe(201);
    const annId = ann.body._id;

    // Volunteer
    await request(server).post('/auth/register').send({ name: 'VolA', email: 'vola@example.com', password: 'password', role: 'Volunteer', whatsappNumber: '999', year: '1st', branch: 'CS' });
    await User.updateOne({ email: 'vola@example.com' }, { isApproved: true, collegeId: ann.body.collegeId });
    const loginVol = await request(server).post('/auth/login').send({ email: 'vola@example.com', password: 'password' });
    const volToken = loginVol.body.token;

    const list = await request(server).get('/announcements').set('Authorization', `Bearer ${volToken}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);

    const mark = await request(server).put(`/announcements/${annId}/read`).set('Authorization', `Bearer ${volToken}`).send();
    expect(mark.status).toBe(200);
  }, 20000);
});
