import { Router } from 'express';
import * as comandaController from '../controllers/comandaController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, comandaController.obtenerComandas);
router.put('/:id/estado', authenticateToken, authorizeRole('cocinero', 'admin'), comandaController.actualizarEstado);

export default router;
