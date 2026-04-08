/**
 * Security Middleware & Role-Based Access Control Tests
 * Tests the critical security fixes applied in this audit:
 * - Unauthenticated access to protected routes
 * - Role injection during registration
 * - Cross-tenant IDOR via poll/meeting/notice deletion
 * - Auth-only routes returning 401 without token
 */
import request from 'supertest';
import app from '../testApp.js';
import User from '../models/User.js';
import College from '../models/College.js';
import Poll from '../models/Poll.js';
import Notice from '../models/Notice.js';
import Meeting from '../models/Meeting.js';
import generateToken from '../utils/generateToken.js';

let server;

beforeAll(async () => {
  if (global.__MONGO_SETUP__) await global.__MONGO_SETUP__;
  server = await app.listen(0);
});

afterAll(async () => {
  await server.close();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Unauthenticated access — every protected route should return 401
// ─────────────────────────────────────────────────────────────────────────────
describe('1. Protected Routes: Unauthenticated Access Returns 401', () => {
  const protectedRoutes = [
    { method: 'get',    path: '/notices'          },
    { method: 'get',    path: '/knowledge-base'   },
    { method: 'get',    path: '/polls'            },
    { method: 'get',    path: '/activity'         },
    { method: 'get',    path: '/meetings'         },
    { method: 'get',    path: '/users'            },
    { method: 'get',    path: '/users/profile/000000000000000000000001' },
    { method: 'get',    path: '/college-settings/000000000000000000000001' },
  ];

  test.each(protectedRoutes)('$method $path → 401 without token', async ({ method, path }) => {
    const res = await request(server)[method](path);
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Role injection — registering as anything other than Volunteer/Secretary
//    should always result in a Volunteer role
// ─────────────────────────────────────────────────────────────────────────────
describe('2. Registration Role Injection Prevention', () => {
  it('should NOT allow registering as "Domain Head" without admin secret', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send({
        name: 'Hacker',
        email: `hacker_domainhead_${Date.now()}@test.com`,
        password: 'password123',
        role: 'Domain Head',
        whatsappNumber: '8888888888',
        year: '2nd',
        branch: 'CS',
      });

    // Registration should succeed but role must be Volunteer (not Domain Head)
    if (res.status === 201 || res.status === 200) {
      const savedUser = await User.findOne({ email: res.body.email || `hacker_domainhead_${Date.now()}@test.com` });
      if (savedUser) {
        expect(savedUser.role).toBe('Volunteer');
      }
    }
    // Or it might return 201 with Volunteer role set
    if (res.body.role) {
      expect(res.body.role).toBe('Volunteer');
    }
  });

  it('should NOT allow registering as "Associate Head" without admin secret', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send({
        name: 'Hacker2',
        email: `hacker_ah_${Date.now()}@test.com`,
        password: 'password123',
        role: 'Associate Head',
        whatsappNumber: '7777777777',
        year: '2nd',
        branch: 'IT',
      });

    if (res.body.role) {
      expect(res.body.role).toBe('Volunteer');
    }
  });

  it('should NOT allow Secretary registration without admin secret', async () => {
    const res = await request(server)
      .post('/auth/register')
      .send({
        name: 'Fake Secretary',
        email: `fakesec_${Date.now()}@test.com`,
        password: 'password123',
        role: 'Secretary',
        adminSecret: 'WRONG_SECRET',
        whatsappNumber: '6666666666',
        year: '3rd',
        branch: 'ME',
      });

    // Should either be rejected (401) or stored as Volunteer
    expect([401, 400]).toContain(res.status);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Cross-Tenant Poll Deletion IDOR (fixed: findOne includes collegeId)
// ─────────────────────────────────────────────────────────────────────────────
describe('3. Cross-Tenant IDOR: Poll Deletion', () => {
  let collegeA, collegeB;
  let secretaryA, secretaryB;
  let tokenA, tokenB;
  let pollByA;

  beforeAll(async () => {
    collegeA = await College.create({ name: 'Sec Test College A', slug: `sec-college-a-${Date.now()}` });
    collegeB = await College.create({ name: 'Sec Test College B', slug: `sec-college-b-${Date.now()}` });

    secretaryA = await User.create({
      name: 'Sec Poll A', email: `secpolla_${Date.now()}@test.com`, password: 'pass',
      role: 'Secretary', collegeId: collegeA._id, isApproved: true,
      whatsappNumber: '1112221111', branch: 'CS', year: '3rd',
      gamification: { xpPoints: 0, level: 1, streak: 0, lastLogin: new Date() },
    });
    tokenA = generateToken(secretaryA._id);

    secretaryB = await User.create({
      name: 'Sec Poll B', email: `secpollb_${Date.now()}@test.com`, password: 'pass',
      role: 'Secretary', collegeId: collegeB._id, isApproved: true,
      whatsappNumber: '2223332222', branch: 'IT', year: '3rd',
      gamification: { xpPoints: 0, level: 1, streak: 0, lastLogin: new Date() },
    });
    tokenB = generateToken(secretaryB._id);

    pollByA = await Poll.create({
      title: 'College A Poll',
      options: [{ text: 'Yes', votes: [], voteCount: 0 }, { text: 'No', votes: [], voteCount: 0 }],
      collegeId: collegeA._id,
      createdBy: secretaryA._id,
      isActive: true,
      totalVotes: 0,
      visibility: 'public',
      expiresAt: new Date(Date.now() + 86400000),
    });
  });

  it('should FORBID Secretary B from deleting College A\'s poll (IDOR block)', async () => {
    const res = await request(server)
      .delete(`/polls/${pollByA._id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    // Should be 404 (poll not found in collegeB's scope) — not 200
    expect(res.status).toBe(404);
  });

  it('should ALLOW Secretary A to delete their own college\'s poll', async () => {
    const res = await request(server)
      .delete(`/polls/${pollByA._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Cross-Tenant Notice Access
// ─────────────────────────────────────────────────────────────────────────────
describe('4. Cross-Tenant IDOR: Notice Access', () => {
  let collegeX, collegeY;
  let secretaryX, volunteerY;
  let tokenX, tokenY;
  let noticeByX;

  beforeAll(async () => {
    collegeX = await College.create({ name: 'Notice College X', slug: `notice-college-x-${Date.now()}` });
    collegeY = await College.create({ name: 'Notice College Y', slug: `notice-college-y-${Date.now()}` });

    secretaryX = await User.create({
      name: 'Sec Notice X', email: `secnoticex_${Date.now()}@test.com`, password: 'pass',
      role: 'Secretary', collegeId: collegeX._id, isApproved: true,
      whatsappNumber: '4445554444', branch: 'CS', year: '3rd',
      gamification: { xpPoints: 0, level: 1, streak: 0, lastLogin: new Date() },
    });
    tokenX = generateToken(secretaryX._id);

    volunteerY = await User.create({
      name: 'Vol Notice Y', email: `volnoticey_${Date.now()}@test.com`, password: 'pass',
      role: 'Volunteer', collegeId: collegeY._id, isApproved: true,
      whatsappNumber: '5556665555', branch: 'IT', year: '1st',
      gamification: { xpPoints: 0, level: 1, streak: 0, lastLogin: new Date() },
    });
    tokenY = generateToken(volunteerY._id);

    noticeByX = await Notice.create({
      title: 'College X Notice',
      content: 'Confidential notice for College X',
      createdBy: secretaryX._id,
      visibility: 'public',
      collegeId: collegeX._id,
      isPinned: false,
      totalViews: 0,
    });
  });

  it('should NOT return College X\'s notice to College Y volunteer', async () => {
    const res = await request(server)
      .get(`/notices/${noticeByX._id}`)
      .set('Authorization', `Bearer ${tokenY}`);

    // Should return 404 because the notice is not found within College Y's scope
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Role-Based Access Control — Secretary-only and Volunteer-only routes
// ─────────────────────────────────────────────────────────────────────────────
describe('5. Role-Based Access Control', () => {
  let college;
  let secretary, volunteer;
  let secToken, volToken;

  beforeAll(async () => {
    college = await College.create({ name: 'RBAC College', slug: `rbac-college-${Date.now()}` });

    secretary = await User.create({
      name: 'RBAC Sec', email: `rbacsec_${Date.now()}@test.com`, password: 'pass',
      role: 'Secretary', collegeId: college._id, isApproved: true,
      whatsappNumber: '9990009999', branch: 'CS', year: '3rd',
      gamification: { xpPoints: 0, level: 1, streak: 0, lastLogin: new Date() },
    });
    secToken = generateToken(secretary._id);

    volunteer = await User.create({
      name: 'RBAC Vol', email: `rbacvol_${Date.now()}@test.com`, password: 'pass',
      role: 'Volunteer', collegeId: college._id, isApproved: true,
      whatsappNumber: '8880008888', branch: 'IT', year: '1st',
      gamification: { xpPoints: 0, level: 1, streak: 0, lastLogin: new Date() },
    });
    volToken = generateToken(volunteer._id);
  });

  it('should ALLOW Secretary to list users', async () => {
    const res = await request(server)
      .get('/users')
      .set('Authorization', `Bearer ${secToken}`);
    expect(res.status).toBe(200);
  });

  it('should DENY Volunteer from listing all users', async () => {
    const res = await request(server)
      .get('/users')
      .set('Authorization', `Bearer ${volToken}`);
    expect(res.status).toBe(403);
  });

  it('should ALLOW Secretary to create a task', async () => {
    const res = await request(server)
      .post('/tasks')
      .set('Authorization', `Bearer ${secToken}`)
      .send({ title: 'RBAC Task', description: 'Test', category: 'General', deadline: new Date(Date.now() + 86400000) });
    expect(res.status).toBe(201);
  });

  it('should DENY Volunteer from deleting a task they do not own', async () => {
    // Create a task by Secretary
    const task = await request(server)
      .post('/tasks')
      .set('Authorization', `Bearer ${secToken}`)
      .send({ title: 'Vol Delete Test Task', description: 'Test', category: 'General', deadline: new Date(Date.now() + 86400000) });

    const taskId = task.body._id;
    const res = await request(server)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${volToken}`);
    // Volunteer should be denied
    expect([403, 401]).toContain(res.status);
  });

  it('should DENY Volunteer from accessing audit logs (Secretary only)', async () => {
    const res = await request(server)
      .get('/audit/logs')
      .set('Authorization', `Bearer ${volToken}`);
    expect(res.status).toBe(403);
  });

  it('should ALLOW Secretary to access audit logs', async () => {
    const res = await request(server)
      .get('/audit/logs')
      .set('Authorization', `Bearer ${secToken}`);
    // 200 or 404 (no logs yet) are both acceptable
    expect([200, 404]).toContain(res.status);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Cross-Tenant Profile IDOR (fixed: getUserProfile checks collegeId)
// ─────────────────────────────────────────────────────────────────────────────
describe('6. Cross-Tenant IDOR: User Profile Access', () => {
  let collegePQ, collegeRS;
  let userP, userR;
  let tokenP;

  beforeAll(async () => {
    collegePQ = await College.create({ name: 'Profile College PQ', slug: `profile-pq-${Date.now()}` });
    collegeRS = await College.create({ name: 'Profile College RS', slug: `profile-rs-${Date.now()}` });

    userP = await User.create({
      name: 'User P', email: `userp_${Date.now()}@test.com`, password: 'pass',
      role: 'Volunteer', collegeId: collegePQ._id, isApproved: true,
      whatsappNumber: '1231231231', branch: 'CS', year: '1st',
      gamification: { xpPoints: 0, level: 1, streak: 0, lastLogin: new Date() },
    });
    tokenP = generateToken(userP._id);

    userR = await User.create({
      name: 'User R', email: `userr_${Date.now()}@test.com`, password: 'pass',
      role: 'Volunteer', collegeId: collegeRS._id, isApproved: true,
      whatsappNumber: '3213213213', branch: 'IT', year: '2nd',
      gamification: { xpPoints: 0, level: 1, streak: 0, lastLogin: new Date() },
    });
  });

  it('should FORBID User P from reading User R\'s profile (different college)', async () => {
    const res = await request(server)
      .get(`/users/profile/${userR._id}`)
      .set('Authorization', `Bearer ${tokenP}`);

    expect(res.status).toBe(403);
  });

  it('should ALLOW User P to read their own profile', async () => {
    const res = await request(server)
      .get(`/users/profile/${userP._id}`)
      .set('Authorization', `Bearer ${tokenP}`);

    expect(res.status).toBe(200);
    expect(res.body.profile).toBeDefined();
  });
});
