import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { webhookDelivery, simularPedido, actualizarEstadoDelivery, listarDeliveryOrders } from '../controllers/deliveryController';
import { getConfigs, updateConfig } from '../controllers/deliveryConfigController';

export const deliveryPublicRouter = Router();
deliveryPublicRouter.post('/webhook/:app', webhookDelivery);

const router = Router();
router.get('/config', authenticateToken, getConfigs);
router.put('/config', authenticateToken, authorizeRole('admin'), updateConfig);
router.post('/simular', authenticateToken, authorizeRole('admin'), simularPedido);
router.get('/orders', authenticateToken, listarDeliveryOrders);
router.put('/orders/:orderId/estado', authenticateToken, authorizeRole('admin'), actualizarEstadoDelivery);

export default router;
