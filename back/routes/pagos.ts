import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { crearOrden, capturarOrden } from '../controllers/pagoController';

const router = Router();
router.use(authenticateToken);
router.post('/crear', crearOrden);
router.post('/capturar', capturarOrden);

export default router;
