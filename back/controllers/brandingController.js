const { Tenant, TenantConfig } = require('../models');
const { registrarAuditoria } = require('../utils/auditoria');

const getBranding = async (req, res) => {
  try {
    const config = await TenantConfig.findOne({ where: { tenant_id: req.tenantId } });
    if (!config) return res.status(404).json({ error: 'Configuración de branding no encontrada' });
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración de branding' });
  }
};

const updateBranding = async (req, res) => {
  try {
    const config = await TenantConfig.findOne({ where: { tenant_id: req.tenantId } });
    if (!config) return res.status(404).json({ error: 'Configuración de branding no encontrada' });

    const allowedFields = ['logo', 'banner', 'colorPrimario', 'colorSecundario', 'colorAcento', 'nombreCompleto', 'fontPrincipal'];
    const campos = {};
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

    res.json(config);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Error al actualizar configuración de branding' });
  }
};

const getPublicBranding = async (req, res) => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ where: { slug, activo: true } });
    if (!tenant) return res.status(404).json({ error: 'Restaurante no encontrado' });

    const config = await TenantConfig.findOne({ where: { tenant_id: tenant.id } });
    if (!config) return res.status(404).json({ error: 'Configuración de branding no encontrada' });

    res.json({ tenant: tenant.nombre, slug: tenant.slug, branding: config });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener branding público' });
  }
};

module.exports = { getBranding, updateBranding, getPublicBranding };
