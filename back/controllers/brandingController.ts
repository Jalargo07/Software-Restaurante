import { Request, Response } from 'express';
import { Tenant, TenantConfig } from '../models';
import registrarAuditoria from '../utils/auditoria';

export const getBranding = async (req: Request, res: Response) => {
  try {
    const config = await TenantConfig.findOne({ where: { tenant_id: req.tenantId } });
    if (!config) return res.status(404).json({ error: 'Configuración de branding no encontrada' });
    return res.json(config);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener configuración de branding' });
  }
};

export const updateBranding = async (req: Request, res: Response) => {
  try {
    const config: any = await TenantConfig.findOne({ where: { tenant_id: req.tenantId } });
    if (!config) return res.status(404).json({ error: 'Configuración de branding no encontrada' });

    const allowedFields = ['logo', 'banner', 'colorPrimario', 'colorSecundario', 'colorAcento', 'nombreCompleto', 'fontPrincipal', 'estiloMenu', 'pais', 'rut', 'razonSocial', 'giro', 'direccion', 'comuna', 'ciudad', 'ambiente'];
    const campos: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        campos[field] = req.body[field];
      }
    }

    if (Object.keys(campos).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    await config.update(campos);

    await registrarAuditoria({
      req,
      accion: 'actualizar',
      entidad: 'TenantConfig',
      entidadId: config.id,
      detalles: { tenant_id: req.tenantId, campos: Object.keys(campos) },
    });

    return res.json(config);
  } catch (error: any) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map((e: any) => e.message).join(', ') });
    }
    return res.status(500).json({ error: 'Error al actualizar configuración de branding' });
  }
};

export const getTenantSlug = async (req: Request, res: Response) => {
  try {
    const tenant: any = await Tenant.findByPk(req.tenantId, { attributes: ['id', 'nombre', 'slug'] });
    if (!tenant) return res.status(404).json({ error: 'Tenant no encontrado' });
    res.json({ nombre: tenant.nombre, slug: tenant.slug });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener información del tenant' });
  }
};

export const getPublicBranding = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const tenant: any = await Tenant.findOne({ where: { slug, activo: true } });
    if (!tenant) return res.status(404).json({ error: 'Restaurante no encontrado' });

    const config = await TenantConfig.findOne({ where: { tenant_id: tenant.id } });
    if (!config) return res.status(404).json({ error: 'Configuración de branding no encontrada' });

    return res.json({ tenant: tenant.nombre, slug: tenant.slug, branding: config });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener branding público' });
  }
};
