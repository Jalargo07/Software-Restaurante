const { Producto } = require('../models');
const { Op } = require('sequelize');
const { registrarAuditoria } = require('../utils/auditoria');
const { scopeTenant, withTenant, belongsToTenant } = require('../utils/tenantScope');
const { invalidarCache } = require('../utils/cacheInvalidation');

const obtenerTodos = async (req, res) => {
  try {
    const { categoria, buscar, activo, tipo } = req.query;
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    else where.activo = true;
    if (categoria) where.categoria = categoria;
    if (tipo) where.tipo = tipo;
    if (buscar) where.nombre = { [Op.like]: `%${buscar}%` };
    const scopedWhere = scopeTenant(where, req.tenantId);

    const productos = await Producto.findAll({ where: scopedWhere });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto || !belongsToTenant(producto, req.tenantId)) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

const crear = async (req, res) => {
  try {
    const datos = withTenant(req.body, req.tenantId);

    const producto = await Producto.create(datos);

    await registrarAuditoria({
      req,
      accion: 'crear',
      entidad: 'Producto',
      entidadId: producto.id,
      detalles: { nombre: producto.nombre, categoria: producto.categoria },
    });

    res.status(201).json(producto);

    invalidarCache(req.tenantId, ['productos', 'reportes']);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const actualizar = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto || !belongsToTenant(producto, req.tenantId)) return res.status(404).json({ error: 'Producto no encontrado' });

    const datos = { ...req.body };

    if (datos.tipo && datos.tipo !== producto.tipo) {
      const receta = await require('../models').Receta.findOne({ where: { productoId: producto.id } });
      if (receta) {
        return res.status(400).json({
          error: `No se puede cambiar el tipo de "${producto.nombre}" porque tiene una receta asociada. Eliminá la receta primero.`,
        });
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

    invalidarCache(req.tenantId, ['productos', 'reportes']);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

const desactivar = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto || !belongsToTenant(producto, req.tenantId)) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update({ activo: false });

    await registrarAuditoria({
      req,
      accion: 'desactivar',
      entidad: 'Producto',
      entidadId: producto.id,
      detalles: { nombre: producto.nombre },
    });

    res.json({ message: 'Producto desactivado' });

    invalidarCache(req.tenantId, ['productos', 'reportes']);
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
