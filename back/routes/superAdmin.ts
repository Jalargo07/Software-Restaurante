import { Router } from 'express';
import { getTenants, getStats, getHistorialCambios, updateTenantEstado, updateTenantPlan } from '../controllers/superAdminController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticateToken, authorizeRole('super-admin'), getStats);
router.get('/historial', authenticateToken, authorizeRole('super-admin'), getHistorialCambios);
router.get('/tenants', authenticateToken, authorizeRole('super-admin'), getTenants);
router.put('/tenants/:id/estado', authenticateToken, authorizeRole('super-admin'), updateTenantEstado);
router.put('/tenants/:id/plan', authenticateToken, authorizeRole('super-admin'), updateTenantPlan);

export default router;
