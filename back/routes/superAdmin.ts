import { Router, Request, Response } from 'express';
import { generateSecret, generateURI, verifySync } from 'otplib';
import { getTenants, getStats, getHistorialCambios, updateTenantEstado, updateTenantPlan } from '../controllers/superAdminController';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import SuperAdmin from '../models/SuperAdmin';

const router = Router();

router.get('/stats', authenticateToken, authorizeRole('super-admin'), getStats);
router.get('/historial', authenticateToken, authorizeRole('super-admin'), getHistorialCambios);
router.get('/tenants', authenticateToken, authorizeRole('super-admin'), getTenants);
router.put('/tenants/:id/estado', authenticateToken, authorizeRole('super-admin'), updateTenantEstado);
router.put('/tenants/:id/plan', authenticateToken, authorizeRole('super-admin'), updateTenantPlan);

// Setup 2FA
router.post('/setup-2fa', authenticateToken, authorizeRole('super-admin'), async (req: Request, res: Response) => {
  try {
    const sa: any = await SuperAdmin.findByPk(req.user?.id);
    if (!sa) return res.status(404).json({ error: 'SuperAdmin no encontrado' });
    if (sa.twoFactorEnabled) return res.status(400).json({ error: '2FA ya activado. Deshabilitalo primero.' });

    const secret = generateSecret();
    const otpauthUrl = generateURI({ issuer: 'BiteOps', label: sa.email, secret });
    res.json({ secret, otpauthUrl });
  } catch (error: any) {
    console.error('Error en setup-2fa:', error);
    res.status(500).json({ error: 'Error al generar 2FA' });
  }
});

// Verify 2FA setup
router.post('/verify-2fa', authenticateToken, authorizeRole('super-admin'), async (req: Request, res: Response) => {
  try {
    const { secret, code } = req.body;
    if (!secret || !code) return res.status(400).json({ error: 'secret y code requeridos' });

    const result = verifySync({ token: code, secret });
    if (!result.valid) return res.status(400).json({ error: 'Código inválido' });

    const sa: any = await SuperAdmin.findByPk(req.user?.id);
    if (!sa) return res.status(404).json({ error: 'SuperAdmin no encontrado' });

    sa.twoFactorSecret = secret;
    sa.twoFactorEnabled = true;
    await sa.save();

    res.json({ message: '2FA activado exitosamente' });
  } catch (error: any) {
    console.error('Error en verify-2fa:', error);
    res.status(500).json({ error: 'Error al verificar 2FA' });
  }
});

// Disable 2FA
router.post('/disable-2fa', authenticateToken, authorizeRole('super-admin'), async (req: Request, res: Response) => {
  try {
    const sa: any = await SuperAdmin.findByPk(req.user?.id);
    if (!sa) return res.status(404).json({ error: 'SuperAdmin no encontrado' });

    sa.twoFactorSecret = null;
    sa.twoFactorEnabled = false;
    await sa.save();

    res.json({ message: '2FA desactivado' });
  } catch (error: any) {
    console.error('Error en disable-2fa:', error);
    res.status(500).json({ error: 'Error al deshabilitar 2FA' });
  }
});

export default router;
