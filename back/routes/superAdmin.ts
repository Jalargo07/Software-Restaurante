import { Router } from 'express';
import { getTenants, updateTenantEstado, updateTenantPlan } from '../controllers/superAdminController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/tenants', authenticateToken, authorizeRole('super-admin'), getTenants);
router.put('/tenants/:id/estado', authenticateToken, authorizeRole('super-admin'), updateTenantEstado);
router.put('/tenants/:id/plan', authenticateToken, authorizeRole('super-admin'), updateTenantPlan);

export default router;
