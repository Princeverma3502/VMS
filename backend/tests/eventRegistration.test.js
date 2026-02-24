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

describe('Event registration', () => {
  it('Secretary creates event; Volunteer registers/unregisters', async () => {
    // Secretary setup
    await request(server).post('/auth/register').send({ name: 'SecE', email: 'sece@example.com', password: 'password', role: 'Secretary', whatsappNumber: '999', year: '4th', branch: 'CS', adminSecret: process.env.ADMIN_SECRET });
    await User.updateOne({ email: 'sece@example.com' }, { isApproved: true, collegeId: new mongoose.Types.ObjectId() });
    const loginSec = await request(server).post('/auth/login').send({ email: 'sece@example.com', password: 'password' });
    const secToken = loginSec.body.token;

    const evt = await request(server).post('/events').set('Authorization', `Bearer ${secToken}`).send({ name: 'E1', date: new Date().toISOString(), type: 'Workshop' });
    expect(evt.status).toBe(201);
    const eventId = evt.body._id;

    // Volunteer setup
    await request(server).post('/auth/register').send({ name: 'VolE', email: 'vole@example.com', password: 'password', role: 'Volunteer', whatsappNumber: '999', year: '1st', branch: 'CS' });
    await User.updateOne({ email: 'vole@example.com' }, { isApproved: true, collegeId: evt.body.collegeId });
    const loginVol = await request(server).post('/auth/login').send({ email: 'vole@example.com', password: 'password' });
    const volToken = loginVol.body.token;

    // Register
    const reg = await request(server).post(`/events/${eventId}/register`).set('Authorization', `Bearer ${volToken}`).send();
    expect(reg.status).toBe(200);

    // Unregister
    const unreg = await request(server).delete(`/events/${eventId}/register`).set('Authorization', `Bearer ${volToken}`).send();
    expect(unreg.status).toBe(200);
  }, 20000);
});
