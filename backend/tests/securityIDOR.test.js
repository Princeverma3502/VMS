import request from 'supertest';
import app from '../testApp.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import College from '../models/College.js';
import generateToken from '../utils/generateToken.js';

let server;

beforeAll(async () => {
    if (global.__MONGO_SETUP__) await global.__MONGO_SETUP__;
    server = await app.listen(0);
});

afterAll(async () => {
    await server.close();
});

describe('Security Patches: IDOR & Multi-Tenant Boundaries', () => {
    let collegeA, collegeB;
    let secretaryA, volunteerB;
    let tokenA, tokenB;
    let taskA, eventA;

    beforeAll(async () => {
        // Create 2 distinct colleges
        collegeA = await College.create({ name: 'College A', slug: 'college-a' });
        collegeB = await College.create({ name: 'College B', slug: 'college-b' });

        // Create Secretary for College A
        secretaryA = await User.create({
            name: 'Sec A', email: 'seca@test.com', password: 'password',
            role: 'Secretary', collegeId: collegeA._id, isApproved: true,
            whatsappNumber: '1111111111', branch: 'CS', year: '3rd',
            gamification: { streak: 1, lastLogin: new Date(), xpPoints: 0, level: 1 }
        });
        tokenA = generateToken(secretaryA._id);

        // Create Volunteer for College B
        volunteerB = await User.create({
            name: 'Vol B', email: 'volb@test.com', password: 'password',
            role: 'Volunteer', collegeId: collegeB._id, isApproved: true,
            whatsappNumber: '2222222222', branch: 'IT', year: '1st',
            gamification: { streak: 1, lastLogin: new Date(), xpPoints: 0, level: 1 }
        });
        tokenB = generateToken(volunteerB._id);

        // Secretary A creates a Task and an Event
        taskA = await Task.create({
            title: 'Task A', description: 'desc', category: 'General', status: 'Pending',
            collegeId: collegeA._id, createdBy: secretaryA._id
        });

        eventA = await Event.create({
            name: 'Event A', date: new Date(), type: 'General', status: 'Upcoming',
            collegeId: collegeA._id, createdBy: secretaryA._id
        });
    });

    it('should FORBID Volunteer B from claiming Task A (Cross-Tenant IDOR Block)', async () => {
        const res = await request(server)
            .put(`/tasks/${taskA._id}/claim`)
            .set('Authorization', `Bearer ${tokenB}`);
        
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/Forbidden/);
    });

    it('should FORBID Volunteer B from registering for Event A (Cross-Tenant IDOR Block)', async () => {
        const res = await request(server)
            .post(`/events/${eventA._id}/register`)
            .set('Authorization', `Bearer ${tokenB}`);
        
        expect(res.status).toBe(403);
    });
});
