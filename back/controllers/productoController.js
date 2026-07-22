const { Producto } = require('../models');
const { Op } = require('sequelize');

const obtenerTodos = async (req, res) => {
  try {
    const { categoria, buscar, activo } = req.query;
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    else where.activo = true;
    if (categoria) where.categoria = categoria;
    if (buscar) where.nombre = { [Op.like]: `%${buscar}%` };

    const productos = await Producto.findAll({ where });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

const crear = async (req, res) => {
  try {
    const producto = await Producto.create(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const actualizar = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update(req.body);
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

const desactivar = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update({ activo: false });
    res.json({ message: 'Producto desactivado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al desactivar producto' });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  desactivar,
};
