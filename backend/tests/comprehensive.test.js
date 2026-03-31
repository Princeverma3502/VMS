import request from 'supertest';
import app from '../testApp.js';
import User from '../models/User.js';
import College from '../models/College.js';
import Poll from '../models/Poll.js';
import Announcement from '../models/Announcement.js';
import generateToken from '../utils/generateToken.js';

let server;

beforeAll(async () => {
    if (global.__MONGO_SETUP__) await global.__MONGO_SETUP__;
    server = await app.listen(0);
});

afterAll(async () => {
    await server.close();
});

describe('Comprehensive VMS Backend Verification', () => {
    let college, secretary, volunteer, token;

    beforeAll(async () => {
        college = await College.create({ name: 'HBTU', slug: 'hbtu' });
        
        secretary = await User.create({
            name: 'Secretary User', email: 'sec@hbtu.ac.in', password: 'password',
            role: 'Secretary', collegeId: college._id, isApproved: true,
            whatsappNumber: '1234567890', branch: 'CS', year: '3rd'
        });
        
        volunteer = await User.create({
            name: 'Volunteer User', email: 'vol@hbtu.ac.in', password: 'password',
            role: 'Volunteer', collegeId: college._id, isApproved: true,
            whatsappNumber: '0987654321', branch: 'IT', year: '1st'
        });

        token = generateToken(secretary._id);
    });

    describe('Polls Module', () => {
        let pollId;

        it('should allow Secretary to create a poll', async () => {
            const res = await request(server)
                .post('/polls')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Next meeting venue?',
                    description: 'Vote for the preferred location',
                    options: ['Room 101', 'Auditorium'], // Backend maps strings to objects
                    expiresAt: new Date(Date.now() + 86400000),
                    visibility: 'all'
                });
            
            expect(res.status).toBe(201);
            expect(res.body.data.title).toBe('Next meeting venue?');
            pollId = res.body.data._id;
        });

        it('should allow Volunteer to vote on poll', async () => {
            const volToken = generateToken(volunteer._id);
            const res = await request(server)
                .put(`/polls/${pollId}/vote`) // Route is PUT
                .set('Authorization', `Bearer ${volToken}`)
                .send({ optionIndex: 0 });
            
            expect(res.status).toBe(200);
            expect(res.body.message).toMatch(/Vote recorded/);
        });

        it('should get poll results', async () => {
            const volToken = generateToken(volunteer._id);
            const res = await request(server)
                .get(`/polls/${pollId}/results`)
                .set('Authorization', `Bearer ${volToken}`); // Now protected
            
            expect(res.status).toBe(200);
            expect(res.body.results[0].votes).toBe(1);
        });
    });

    describe('Announcements Module', () => {
        let announcementId;

        it('should create an announcement', async () => {
            const res = await request(server)
                .post('/announcements')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Urgent: Blood Donation',
                    content: 'Need O+ donors at civil hospital.',
                    priority: 'Urgent',
                    scope: 'Global'
                });
            
            expect(res.status).toBe(201);
            announcementId = res.body._id;
        });

        it('should allow student to mark as read', async () => {
            const volToken = generateToken(volunteer._id);
            const res = await request(server)
                .put(`/announcements/${announcementId}/read`) // Route is PUT
                .set('Authorization', `Bearer ${volToken}`);
            
            expect(res.status).toBe(200);
        });
    });

    describe('User Management', () => {
        it('should allow Secretary to fetch all users in college', async () => {
            const res = await request(server)
                .get('/users')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).toBe(200);
            // Result is usually an array of users for the college
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it('should update volunteer role', async () => {
            const res = await request(server)
                .put(`/users/${volunteer._id}/role`)
                .set('Authorization', `Bearer ${token}`)
                .send({ role: 'Associate Head' });
            
            expect(res.status).toBe(200);
            const updated = await User.findById(volunteer._id);
            expect(updated.role).toBe('Associate Head');
        });
    });

    describe('Gamification & Profile', () => {
        it('should fetch user profile with XP stats', async () => {
            const volToken = generateToken(volunteer._id);
            const res = await request(server)
                .get(`/users/profile/${volunteer._id}`)
                .set('Authorization', `Bearer ${volToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.profile).toHaveProperty('gamification');
        });
    });
});
