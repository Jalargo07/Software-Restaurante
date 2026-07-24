const jwt = require('jsonwebtoken');
const { Tenant } = require('../models');

const tenantContext = async (req, res, next) => {
  try {
    let tenantId = null;
    let tenantSlug = null;

    // 1. Si el usuario está autenticado, intentar extraer del token JWT
    if (req.user && req.user.tenantId) {
      tenantId = req.user.tenantId;
    } else {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded && decoded.tenantId) {
            tenantId = decoded.tenantId;
            if (!req.user) req.user = decoded;
          }
        } catch (e) {
          // Token inválido será manejado por authenticateToken
        }
      }
    }

    // 2. Si no, buscar en headers HTTP
    if (!tenantId) {
      tenantId = req.headers['x-tenant-id'];
      tenantSlug = req.headers['x-tenant-slug'];
    }

    let tenant = null;

    if (tenantId) {
      tenant = await Tenant.findByPk(tenantId);
    } else if (tenantSlug) {
      tenant = await Tenant.findOne({ where: { slug: tenantSlug } });
    } else {
      // Fallback al Tenant por defecto (id: 1)
      tenant = await Tenant.findByPk(1);
    }

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant (Restaurante) no encontrado' });
    }

    if (!tenant.activo) {
      return res.status(403).json({ error: 'El restaurante se encuentra inactivo o suspendido' });
    }

    req.tenantId = tenant.id;
    req.tenant = tenant;

    next();
  } catch (error) {
    console.error('Error en tenantContext middleware:', error);
    return res.status(500).json({ error: 'Error al procesar el contexto del restaurante' });
  }
};

module.exports = tenantContext;
