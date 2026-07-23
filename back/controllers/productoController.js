const { Producto } = require('../models');
const { Op } = require('sequelize');
const { registrarAuditoria } = require('../utils/auditoria');

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
    const datos = { ...req.body };
    if (datos.categoria !== 'insumo') {
      delete datos.codigoBarras;
    }

    if (datos.categoria === 'insumo' && datos.codigoBarras) {
      const existente = await Producto.findOne({
        where: { codigoBarras: datos.codigoBarras, activo: true },
      });
      if (existente) {
        return res.status(400).json({ error: 'Ya existe un insumo con ese código de barras' });
      }
    }

    const producto = await Producto.create(datos);

    await registrarAuditoria({
      req,
      accion: 'crear',
      entidad: 'Producto',
      entidadId: producto.id,
      detalles: { nombre: producto.nombre, categoria: producto.categoria },
    });

    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const actualizar = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const datos = { ...req.body };
    if (datos.categoria !== 'insumo') {
      delete datos.codigoBarras;
    }

    if (datos.categoria === 'insumo' && datos.codigoBarras) {
      const existente = await Producto.findOne({
        where: {
          codigoBarras: datos.codigoBarras,
          activo: true,
          id: { [Op.ne]: req.params.id },
        },
      });
      if (existente) {
        return res.status(400).json({ error: 'Ya existe un insumo con ese código de barras' });
      }
    }

    await producto.update(datos);

    await registrarAuditoria({
      req,
      accion: 'actualizar',
      entidad: 'Producto',
      entidadId: producto.id,
      detalles: { nombre: producto.nombre, cambios: Object.keys(datos) },
    });

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

    await registrarAuditoria({
      req,
      accion: 'desactivar',
      entidad: 'Producto',
      entidadId: producto.id,
      detalles: { nombre: producto.nombre },
    });

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
