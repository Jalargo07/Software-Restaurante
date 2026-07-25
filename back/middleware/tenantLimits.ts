import { Request, Response, NextFunction } from 'express';
import { Tenant, Producto, Usuario, Venta, Auditoria } from '../models';
import { Op } from 'sequelize';

export const checkTenantLimit = (limitType: 'producto' | 'venta' | 'usuario' | 'upload') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.tenantId || req.user?.tenantId;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant no especificado' });
      }

      const tenant: any = await Tenant.findByPk(tenantId);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant no encontrado' });
      }

      const plan = tenant.plan || 'basico';
      if (plan === 'enterprise') {
        return next();
      }

      if (limitType === 'producto') {
        const count = await Producto.count({ where: { tenant_id: tenantId } });
        if (plan === 'basico' && count >= 50) {
          return res.status(403).json({ error: 'Límite de productos alcanzado para el plan Básico (máximo 50)' });
        }
        if (plan === 'pro' && count >= 500) {
          return res.status(403).json({ error: 'Límite de productos alcanzado para el plan Pro (máximo 500)' });
        }
      } else if (limitType === 'usuario') {
        const count = await Usuario.count({ where: { tenant_id: tenantId } });
        if (plan === 'basico' && count >= 2) {
          return res.status(403).json({ error: 'Límite de usuarios alcanzado para el plan Básico (máximo 2)' });
        }
        if (plan === 'pro' && count >= 10) {
          return res.status(403).json({ error: 'Límite de usuarios alcanzado para el plan Pro (máximo 10)' });
        }
      } else if (limitType === 'venta') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = await Venta.count({
          where: {
            tenant_id: tenantId,
            createdAt: {
              [Op.gte]: startOfDay,
            },
          },
        });

        if (plan === 'basico' && count >= 20) {
          return res.status(403).json({ error: 'Límite de ventas diarias alcanzado para el plan Básico (máximo 20)' });
        }
        if (plan === 'pro' && count >= 200) {
          return res.status(403).json({ error: 'Límite de ventas diarias alcanzado para el plan Pro (máximo 200)' });
        }
      } else if (limitType === 'upload') {
        // Límite de uploads por día (imágenes)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = await Auditoria.count({
          where: {
            usuarioId: req.user?.id,
            accion: 'UPLOAD_IMAGEN',
            createdAt: {
              [Op.gte]: startOfDay,
            },
          },
        });

        if (plan === 'basico' && count >= 20) {
          return res.status(403).json({ error: 'Límite de uploads diarios alcanzado para el plan Básico (máximo 20)' });
        }
        if (plan === 'pro' && count >= 100) {
          return res.status(403).json({ error: 'Límite de uploads diarios alcanzado para el plan Pro (máximo 100)' });
        }
      }

      next();
    } catch (error: any) {
      console.error('Error en checkTenantLimit:', error);
      return res.status(500).json({ error: 'Error al verificar límites del plan' });
    }
  };
};
