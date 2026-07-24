import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Tenant } from '../models';

export const tenantContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let tenantId: any = null;
    let tenantSlug: any = null;

    if (req.user && req.user.tenantId) {
      tenantId = req.user.tenantId;
    } else {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
          if (decoded && decoded.tenantId) {
            tenantId = decoded.tenantId;
            if (!req.user) req.user = decoded;
          }
        } catch (e) {
          // Token inválido será manejado por authenticateToken
        }
      }
    }

    if (!tenantId) {
      tenantId = req.headers['x-tenant-id'];
      tenantSlug = req.headers['x-tenant-slug'];
    }

    let tenant: any = null;

    if (tenantId) {
      tenant = await Tenant.findByPk(tenantId);
    } else if (tenantSlug) {
      tenant = await Tenant.findOne({ where: { slug: tenantSlug } });
    } else {
      tenant = await Tenant.findByPk(1);
    }

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant (Restaurante) no encontrado' });
    }

    if (!tenant.activo || tenant.estado === 'suspendido') {
      return res.status(403).json({ error: 'El restaurante se encuentra inactivo o suspendido' });
    }

    req.tenantId = tenant.id;
    req.tenant = tenant;

    next();
  } catch (error: any) {
    console.error('Error en tenantContext middleware:', error);
    return res.status(500).json({ error: 'Error al procesar el contexto del restaurante' });
  }
};

export default tenantContext;
