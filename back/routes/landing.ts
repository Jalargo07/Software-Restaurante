import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { getPublicLanding, getLanding, updateLanding } from '../controllers/landingController';

const router = Router();

export const landingPublicRouter = Router();
landingPublicRouter.get('/landing', getPublicLanding);

router.get('/', authenticateToken, authorizeRole('super-admin'), getLanding);
router.put('/', authenticateToken, authorizeRole('super-admin'), updateLanding);

export default router;
