import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin';
import { loginLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const superadmin: any = await SuperAdmin.findOne({ where: { email, activo: true } });
    if (!superadmin) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, superadmin.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: superadmin.id, nombre: superadmin.nombre, email: superadmin.email, rol: 'super-admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: superadmin.id, nombre: superadmin.nombre, email: superadmin.email, rol: 'super-admin' } });
  } catch (error: any) {
    console.error('Error en super-admin login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

export default router;
