import { Router } from 'express';
import * as contactoController from '../controllers/contactoController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.post('/', contactoController.crearMensaje);
router.get('/', authenticateToken, authorizeRole('admin'), contactoController.listarMensajes);
router.put('/:id/leer', authenticateToken, authorizeRole('admin'), contactoController.marcarLeido);

export default router;
