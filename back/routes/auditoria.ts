import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { obtenerLogs } from '../controllers/auditoriaController';

const router = Router();

router.get('/', authenticateToken, authorizeRole('admin'), obtenerLogs);

export default router;
