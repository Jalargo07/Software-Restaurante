import { Router } from 'express';
import * as brandingController from '../controllers/brandingController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, brandingController.getBranding);
router.put('/', authenticateToken, authorizeRole('admin'), brandingController.updateBranding);

export default router;
