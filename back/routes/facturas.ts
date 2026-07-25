import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { timbrar, obtenerPorVenta, listar, reintentar } from '../controllers/facturaController';

const router = Router();
router.use(authenticateToken);
router.get('/', listar);
router.get('/:ventaId', obtenerPorVenta);
router.post('/:ventaId/timbrar', timbrar);
router.post('/:id/reintentar', reintentar);

export default router;
