import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifySync } from 'otplib';
import SuperAdmin from '../models/SuperAdmin';
import { loginLimiter } from '../middleware/rateLimit';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// LOGIN (paso 1)
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const sa: any = await SuperAdmin.findOne({ where: { email, activo: true } });
    if (!sa) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, sa.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    if (sa.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: sa.id, type: '2fa' },
        process.env.JWT_SECRET!,
        { expiresIn: '5m' }
      );
      return res.json({ twoFactorRequired: true, tempToken });
    }

    const token = jwt.sign(
      { id: sa.id, nombre: sa.nombre, email: sa.email, rol: 'super-admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '20m' }
    );
    res.json({ token, usuario: { id: sa.id, nombre: sa.nombre, email: sa.email, rol: 'super-admin' } });
  } catch (error: any) {
    console.error('Error en super-admin login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// LOGIN 2FA (paso 2)
router.post('/login-2fa', async (req: Request, res: Response) => {
  try {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) return res.status(400).json({ error: 'tempToken y code requeridos' });

    const payload: any = jwt.verify(tempToken, process.env.JWT_SECRET!);
    if (payload.type !== '2fa') return res.status(401).json({ error: 'Token inválido' });

    const sa: any = await SuperAdmin.findByPk(payload.id);
    if (!sa || !sa.twoFactorSecret) return res.status(401).json({ error: '2FA no configurado' });

    const result = verifySync({ token: code, secret: sa.twoFactorSecret });
    if (!result.valid) return res.status(401).json({ error: 'Código inválido' });

    const token = jwt.sign(
      { id: sa.id, nombre: sa.nombre, email: sa.email, rol: 'super-admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '20m' }
    );
    res.json({ token, usuario: { id: sa.id, nombre: sa.nombre, email: sa.email, rol: 'super-admin' } });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expirado, reiniciá el login' });
    console.error('Error en login-2fa:', error);
    res.status(500).json({ error: 'Error al verificar 2FA' });
  }
});

export default router;
