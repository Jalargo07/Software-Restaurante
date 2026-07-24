const { Auditoria, Usuario } = require('../models');
const { Op } = require('sequelize');
const { scopeTenant } = require('../utils/tenantScope');

const obtenerLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.usuario) {
      where[Op.or] = [
        { usuarioEmail: { [Op.like]: `%${req.query.usuario}%` } },
      ];
    }
    if (req.query.entidad) {
      where.entidad = req.query.entidad;
    }
    if (req.query.desde || req.query.hasta) {
      where.createdAt = {};
      if (req.query.desde) where.createdAt[Op.gte] = new Date(req.query.desde);
      if (req.query.hasta) {
        const hasta = new Date(req.query.hasta);
        hasta.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = hasta;
      }
    }

    const { count, rows } = await Auditoria.findAndCountAll({
      where: scopeTenant(where, req.tenantId),
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      logs: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    res.status(500).json({ error: 'Error al obtener logs de auditoría' });
  }
};

module.exports = { obtenerLogs };
