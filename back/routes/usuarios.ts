import { Router, Request, Response } from 'express';
import Usuario from '../models/Usuario';
import Tenant from '../models/Tenant';
import SessionActiva from '../models/SessionActiva';
import RefreshToken from '../models/RefreshToken';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authenticateToken, authorizeRole, generateAccessToken, generateRefreshToken, hashToken } from '../middleware/auth';
import { checkTenantLimit } from '../middleware/tenantLimits';
import { loginLimiter } from '../middleware/rateLimit';
import { scopeTenant, withTenant, belongsToTenant } from '../utils/tenantScope';
import { checkLicense } from '../utils/licenseGuard';
import { settings } from '../config/settings';

const router = Router();

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const tenant: any = await Tenant.findByPk(usuario.tenant_id, { attributes: ['plan'] });
    const plan = tenant?.plan || 'basico';

    const accessToken = generateAccessToken({
      usuarioId: usuario.id,
      tenantId: usuario.tenant_id,
      rol: usuario.rol,
      plan
    });
    const refreshToken = generateRefreshToken({
      usuarioId: usuario.id,
      tenantId: usuario.tenant_id
    });

    const refreshTokenHash = hashToken(refreshToken);
    await RefreshToken.create({
      token: refreshTokenHash,
      usuarioId: usuario.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await SessionActiva.create({
      tokenId: accessToken.substring(0, 20),
      usuarioId: usuario.id,
      tenantId: usuario.tenant_id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    const loginResponse: any = {
      ok: true,
      accessToken,
      refreshToken,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, tenantId: usuario.tenant_id, plan },
      expiresIn: 15 * 60
    };

    const licencia = checkLicense();
    if (!licencia.ok) {
      loginResponse.licenseWarning = licencia.warning || 'Licencia inválida o ausente';
    }

    res.json(loginResponse);
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ ok: false, error: 'Refresh token requerido' });
    }

    const payload = jwt.verify(refreshToken, settings.jwt.secret) as { usuarioId: number; tenantId: number };

    const tokenHash = hashToken(refreshToken);
    const storedToken = await RefreshToken.findOne({
      where: { token: tokenHash, revokedAt: null }
    });

    if (!storedToken) {
      return res.status(401).json({ ok: false, error: 'Refresh token inválido o revocado' });
    }

    await RefreshToken.update(
      { revokedAt: new Date(), replacedByToken: tokenHash },
      { where: { id: (storedToken as any).id } }
    );

    const usuario = await Usuario.findByPk(payload.usuarioId);
    if (!usuario) {
      return res.status(401).json({ ok: false, error: 'Usuario no encontrado' });
    }

    const tenant: any = await Tenant.findByPk(usuario.tenant_id, { attributes: ['plan'] });
    const plan = tenant?.plan || 'basico';

    const newAccessToken = generateAccessToken({
      usuarioId: usuario.id,
      tenantId: usuario.tenant_id,
      rol: usuario.rol,
      plan
    });
    const newRefreshToken = generateRefreshToken({
      usuarioId: usuario.id,
      tenantId: usuario.tenant_id
    });

    const newTokenHash = hashToken(newRefreshToken);
    await RefreshToken.create({
      token: newTokenHash,
      usuarioId: usuario.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      ok: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60
    });
  } catch (error) {
    return res.status(401).json({ ok: false, error: 'Refresh token inválido' });
  }
});

router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { usuarioId: req.user!.usuarioId, revokedAt: null } }
    );
    res.json({ ok: true, mensaje: 'Logout exitoso' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

router.get('/', authenticateToken, authorizeRole('admin'), async (req: Request, res: Response) => {
  const usuarios = await Usuario.findAll({ where: scopeTenant({}, req.tenantId!), attributes: { exclude: ['password'] } });
  res.json(usuarios);
});

router.post('/', authenticateToken, authorizeRole('admin'), checkTenantLimit('usuario'), async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y password son requeridos' });
    }
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(400).json({ error: 'El email ya está registrado' });
    const usuario = await Usuario.create(withTenant({ nombre, email, password, rol: rol || 'mesero' }, req.tenantId!));
    res.status(201).json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/:id', authenticateToken, authorizeRole('admin'), async (req: Request, res: Response) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id));
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (!belongsToTenant(usuario, req.tenantId!)) return res.status(403).json({ error: 'Acceso denegado' });

    const { nombre, email, password, rol, activo } = req.body;
    if (email && email !== usuario.email) {
      const existe = await Usuario.findOne({ where: { email } });
      if (existe) return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const datos: any = {};
    if (nombre !== undefined) datos.nombre = nombre;
    if (email !== undefined) datos.email = email;
    if (rol !== undefined) datos.rol = rol;
    if (activo !== undefined) datos.activo = activo;
    if (password) datos.password = password;

    await usuario.update(datos);
    res.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, activo: usuario.activo });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', authenticateToken, authorizeRole('admin'), async (req: Request, res: Response) => {
  try {
    const usuario = await Usuario.findByPk(Number(req.params.id));
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (!belongsToTenant(usuario, req.tenantId!)) return res.status(403).json({ error: 'Acceso denegado' });
    await usuario.update({ activo: false });
    res.json({ message: 'Usuario desactivado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

router.get('/sessions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const sesiones = await SessionActiva.findAll({
      where: { usuarioId: req.user!.id, revokeAt: null },
      attributes: ['id', 'ipAddress', 'userAgent', 'loginAt', 'ultimoUso']
    });
    res.json({ ok: true, sesiones });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener sesiones' });
  }
});

router.delete('/sessions', authenticateToken, async (req: Request, res: Response) => {
  try {
    await SessionActiva.update(
      { revokeAt: new Date() },
      { where: { usuarioId: req.user!.id, revokeAt: null } }
    );
    res.json({ ok: true, mensaje: 'Sesiones revocadas' });
  } catch (error) {
    res.status(500).json({ error: 'Error al revocar sesiones' });
  }
});

export default router;
