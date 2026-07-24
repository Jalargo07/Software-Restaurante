import { Request, Response } from 'express';
import { Tenant, Producto, Usuario, Venta, TenantConfig } from '../models';
import { Op } from 'sequelize';
import registrarAuditoria from '../utils/auditoria';

export const getTenants = async (req: Request, res: Response) => {
  try {
    const tenants: any = await Tenant.findAll({
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
