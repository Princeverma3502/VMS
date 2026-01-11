import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import impactController from '../controllers/impactController.js';

const router = express.Router();

// SOS Blood Donation
router.post('/sos/create', protect, impactController.createSOSBroadcast);
router.post('/sos/:sosId/respond', protect, impactController.respondToSOS);
router.get('/sos/college/:collegeId/active', protect, impactController.getActiveSOSBroadcasts);

// Wall of Kindness
router.post('/wall/post', protect, impactController.createWallPost);
router.get('/wall/college/:collegeId', protect, impactController.getWallPosts);
router.post('/wall/:postId/heart', protect, impactController.heartPost);

// Skill Endorsements
router.post('/endorsement', protect, impactController.endorseSkill);
router.get('/endorsements/:userId', protect, impactController.getUserEndorsements);

// Reflections Journal
router.post('/reflection', protect, impactController.createReflection);
router.get('/reflections/:userId', protect, impactController.getUserReflections);
router.put('/reflection/:reflectionId', protect, impactController.updateReflection);
router.delete('/reflection/:reflectionId', protect, impactController.deleteReflection);

// Impact Map
router.get('/map/college/:collegeId', protect, impactController.getImpactMap);

export default router;
