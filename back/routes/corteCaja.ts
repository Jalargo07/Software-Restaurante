import { Router } from 'express';
import * as corteController from '../controllers/corteController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import cacheMiddleware from '../middleware/cache';

const router = Router();

const rolesCaja = ['admin', 'cajero'];

router.get('/resumen', authenticateToken, authorizeRole(...rolesCaja), cacheMiddleware(30), corteController.obtenerResumen);
router.get('/', authenticateToken, authorizeRole(...rolesCaja), cacheMiddleware(60), corteController.obtenerCortes);
router.get('/:id', authenticateToken, authorizeRole(...rolesCaja), corteController.obtenerCortePorId);
router.post('/cerrar', authenticateToken, authorizeRole(...rolesCaja), corteController.cerrarCaja);

export default router;
