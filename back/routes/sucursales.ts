import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import * as sucursalController from '../controllers/sucursalController';

const router = Router();
router.use(authenticateToken);
router.get('/', authorizeRole('admin'), sucursalController.listar);
router.post('/', authorizeRole('admin'), sucursalController.crear);
router.put('/:id', authorizeRole('admin'), sucursalController.actualizar);
router.delete('/:id', authorizeRole('admin'), sucursalController.eliminar);

export default router;
