const { Router } = require('express');
const Mesa = require('../models/Mesa');
const { authenticateToken } = require('../middleware/auth');
const { scopeTenant, withTenant, belongsToTenant } = require('../utils/tenantScope');

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  const where = {};
  if (req.query.estado) where.estado = req.query.estado;
  const mesas = await Mesa.findAll({ where: scopeTenant(where, req.tenantId) });
  res.json(mesas);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const mesa = await Mesa.findByPk(req.params.id);
  if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
  if (!belongsToTenant(mesa, req.tenantId)) return res.status(403).json({ error: 'Acceso denegado' });
  res.json(mesa);
});

router.post('/', authenticateToken, async (req, res) => {
  const mesa = await Mesa.create(withTenant(req.body, req.tenantId));
  res.status(201).json(mesa);
});

router.put('/:id', authenticateToken, async (req, res) => {
  const mesa = await Mesa.findByPk(req.params.id);
  if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
  if (!belongsToTenant(mesa, req.tenantId)) return res.status(403).json({ error: 'Acceso denegado' });
  await mesa.update(req.body);
  res.json(mesa);
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const mesa = await Mesa.findByPk(req.params.id);
  if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
  if (!belongsToTenant(mesa, req.tenantId)) return res.status(403).json({ error: 'Acceso denegado' });
  await mesa.destroy();
  res.json({ message: 'Mesa eliminada' });
});

module.exports = router;
