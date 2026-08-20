import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { crearOrden, capturarOrden, crearPreferenciaMercadoPago, webhookMercadoPago } from '../controllers/pagoController';

const router = Router();
router.use(authenticateToken);
router.post('/crear', crearOrden);
router.post('/capturar', capturarOrden);
router.post('/mercadopago/crear', crearPreferenciaMercadoPago);
router.post('/mercadopago/webhook', webhookMercadoPago);

export default router;
