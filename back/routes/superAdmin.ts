import { Router } from 'express';
import { getTenants, updateTenantEstado, updateTenantPlan } from '../controllers/superAdminController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/tenants', authenticateToken, authorizeRole('super-admin', 'admin'), getTenants);
router.put('/tenants/:id/estado', authenticateToken, authorizeRole('super-admin', 'admin'), updateTenantEstado);
router.put('/tenants/:id/plan', authenticateToken, authorizeRole('super-admin', 'admin'), updateTenantPlan);

export default router;
