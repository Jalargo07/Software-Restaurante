import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { webhookDelivery, simularPedido } from '../controllers/deliveryController';
import { getConfigs, updateConfig } from '../controllers/deliveryConfigController';

export const deliveryPublicRouter = Router();
deliveryPublicRouter.post('/webhook/:app', webhookDelivery);

const router = Router();
router.get('/config', authenticateToken, getConfigs);
router.put('/config', authenticateToken, authorizeRole('admin'), updateConfig);
router.post('/simular', authenticateToken, authorizeRole('admin'), simularPedido);

export default router;
