import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { obtenerOnboarding, completarStep1, completarStep2, completarStep3 } from '../controllers/onboardingController';

const router = Router();

router.get('/', authenticateToken, obtenerOnboarding);
router.post('/step1', authenticateToken, completarStep1);
router.post('/step2', authenticateToken, completarStep2);
router.post('/step3', authenticateToken, completarStep3);

export default router;