const { Auditoria } = require('../models');

const registrarAuditoria = async ({ req, accion, entidad, entidadId, detalles }) => {
  try {
    await Auditoria.create({
      usuarioId: req.user?.id || null,
      usuarioEmail: req.user?.email || null,
      accion,
      entidad,
      entidadId: entidadId || null,
      detalles: detalles || null,
      ipAddress: req.ip || req.connection?.remoteAddress || null,
      userAgent: req.headers?.['user-agent'] || null,
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error.message);
  }
};

module.exports = { registrarAuditoria };
