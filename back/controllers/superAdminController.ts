import { Request, Response } from 'express';
import { Tenant, Producto, Usuario, Venta, TenantConfig, Auditoria } from '../models';
import { Op } from 'sequelize';
import registrarAuditoria from '../utils/auditoria';

export const getStats = async (req: Request, res: Response) => {
  try {
    const total = await Tenant.count();
    const activos = await Tenant.count({ where: { estado: 'activo' } });
    const suspendidos = await Tenant.count({ where: { estado: 'suspendido' } });
    const pendientes = await Tenant.count({ where: { estado: 'pendiente_aprobacion' } });
    
    const tenants = await Tenant.findAll({ attributes: ['plan', 'estado'] }) as any[];
    const ingresosEstimados = tenants.reduce((sum: number, t: any) => {
      if (t.estado !== 'activo') return sum;
      const precios: Record<string, number> = { basico: 39900, pro: 69900, enterprise: 179900 };
      return sum + (precios[t.plan] || 0);
    }, 0);

    res.json({ total, activos, suspendidos, pendientes, ingresosEstimados });
  } catch (error: any) {
    console.error('Error en getStats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

export const getHistorialCambios = async (req: Request, res: Response) => {
  try {
    const historial = await Auditoria.findAll({
      where: { accion: { [Op.in]: ['UPDATE_TENANT_PLAN', 'UPDATE_TENANT_ESTADO'] } },
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
    res.json(historial);
  } catch (error: any) {
    console.error('Error en getHistorialCambios:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

export const getTenants = async (req: Request, res: Response) => {
  try {
    const { plan, estado } = req.query;
    const where: any = {};
    if (plan) where.plan = plan;
    if (estado) where.estado = estado;

    const tenants: any = await Tenant.findAll({
      where,
      include: [{ model: TenantConfig, required: false }],
      order: [['id', 'ASC']],
    });

    const results = await Promise.all(
      tenants.map(async (t: any) => {
        const productosCount = await Producto.count({ where: { tenant_id: t.id } });
        const usuariosCount = await Usuario.count({ where: { tenant_id: t.id } });
        
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const ventasHoyCount = await Venta.count({
          where: {
            tenant_id: t.id,
            createdAt: { [Op.gte]: startOfDay },
          },
        });

        return {
          ...t.toJSON(),
          productosCount,
          usuariosCount,
          ventasHoyCount,
        };
      })
    );

    return res.json(results);
  } catch (error: any) {
    console.error('Error al obtener tenants (Super Admin):', error);
    return res.status(500).json({ error: 'Error al obtener lista de tenants' });
  }
};

export const updateTenantEstado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['pendiente_aprobacion', 'activo', 'suspendido'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const tenant: any = await Tenant.findByPk(id as string);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant no encontrado' });
    }

    tenant.estado = estado;
    tenant.activo = estado === 'activo';
    await tenant.save();

    await registrarAuditoria({
      req,
      accion: 'UPDATE_TENANT_ESTADO',
      entidad: 'Tenant',
      entidadId: tenant.id,
      detalles: { estado, activo: tenant.activo },
    });

    return res.json({ message: 'Estado de tenant actualizado correctamente', tenant });
  } catch (error: any) {
    console.error('Error al actualizar estado de tenant:', error);
    return res.status(500).json({ error: 'Error al actualizar estado del tenant' });
  }
};

export const updateTenantPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (!['basico', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Plan inválido' });
    }

    const tenant: any = await Tenant.findByPk(id as string);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant no encontrado' });
    }

    tenant.plan = plan;
    await tenant.save();

    await registrarAuditoria({
      req,
      accion: 'UPDATE_TENANT_PLAN',
      entidad: 'Tenant',
      entidadId: tenant.id,
      detalles: { plan },
    });

    return res.json({ message: 'Plan de tenant actualizado correctamente', tenant });
  } catch (error: any) {
    console.error('Error al actualizar plan de tenant:', error);
    return res.status(500).json({ error: 'Error al actualizar plan del tenant' });
  }
};
