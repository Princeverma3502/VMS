import request from 'supertest';
import app from '../testApp.js';
import User from '../models/User.js';

let server;

beforeAll(async () => {
  await global.__MONGO_SETUP__;
  server = await app.listen(0);
});

afterAll(async () => {
  await server.close();
});

describe('Auth routes', () => {
  it('should register and login a user', async () => {
    const registerRes = await request(server)
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'Volunteer',
        whatsappNumber: '9999999999',
        year: '1st',
        branch: 'CS'
      });

    expect([201, 200]).toContain(registerRes.status);
    // approve the user so they can login in test environment
    await User.updateOne({ email: 'testuser@example.com' }, { isApproved: true });

    const loginRes = await request(server)
      .post('/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  }, 20000);
});
