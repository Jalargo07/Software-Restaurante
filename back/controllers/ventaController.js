const { Venta, DetalleVenta, Producto, Mesa } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

const obtenerTodas = async (req, res) => {
  try {
    const where = {};
    if (req.query.estado) where.estado = req.query.estado;
    const ventas = await Venta.findAll({
      where,
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
      order: [['createdAt', 'DESC']],
    });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener venta' });
  }
};

const crear = async (req, res) => {
  try {
    const { mesaId } = req.body;

    const venta = await Venta.create({
      mesaId: mesaId || null,
      total: 0,
      estado: 'abierta',
    });

    if (mesaId) {
      await Mesa.update({ estado: 'ocupada' }, { where: { id: mesaId } });
    }

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.status(201).json(ventaCompleta);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear venta' });
  }
};

const agregarProductos = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    if (venta.estado !== 'abierta') return res.status(400).json({ error: 'La venta ya esta cerrada' });

    const { productos } = req.body;

    let totalAgregado = 0;

    for (const item of productos) {
      const producto = await Producto.findByPk(item.productoId);
      if (!producto) {
        return res.status(400).json({ error: `Producto ${item.productoId} no encontrado` });
      }

      const precio = item.precioUnitario || Number(producto.precioVenta);
      const subtotal = item.cantidad * precio;
      totalAgregado += subtotal;

      await DetalleVenta.create({
        VentaId: venta.id,
        ProductoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: precio,
        subtotal,
      });
    }

    await venta.update({ total: Number(venta.total) + totalAgregado });

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.json(ventaCompleta);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar productos' });
  }
};

const cobrar = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const venta = await Venta.findByPk(req.params.id, { transaction: t });
    if (!venta) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    if (venta.estado !== 'abierta') {
      await t.rollback();
      return res.status(400).json({ error: 'La venta ya esta cerrada o cancelada' });
    }

    const { metodoPago } = req.body;

    const detalles = await DetalleVenta.findAll({
      where: { VentaId: venta.id },
      include: [Producto],
      transaction: t,
    });

    for (const detalle of detalles) {
      if (detalle.Producto) {
        const nuevoStock = detalle.Producto.stock - detalle.cantidad;
        await detalle.Producto.update({ stock: nuevoStock }, { transaction: t });
      }
    }

    await venta.update({
      estado: 'cerrada',
      metodoPago: metodoPago || null,
      total: Number(venta.total),
    }, { transaction: t });

    if (venta.mesaId) {
      await Mesa.update({ estado: 'disponible' }, {
        where: { id: venta.mesaId },
        transaction: t,
      });
    }

    await t.commit();

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.json(ventaCompleta);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al cobrar venta' });
  }
};

const crearRapida = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { mesaId, metodoPago, productos, cliente } = req.body;

    let total = 0;
    for (const item of productos) {
      const prod = await Producto.findByPk(item.productoId, { transaction: t });
      const precio = item.precioUnitario || (prod ? Number(prod.precioVenta) : 0);
      total += item.cantidad * precio;
    }

    const venta = await Venta.create({
      mesaId: mesaId || null,
      total,
      metodoPago,
      cliente,
      estado: 'cerrada',
    }, { transaction: t });

    for (const item of productos) {
      const producto = await Producto.findByPk(item.productoId, { transaction: t });
      if (!producto) {
        await t.rollback();
        return res.status(400).json({ error: `Producto ${item.productoId} no encontrado` });
      }

      const precio = item.precioUnitario || Number(producto.precioVenta);
      const subtotal = item.cantidad * precio;

      await DetalleVenta.create({
        VentaId: venta.id,
        ProductoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: precio,
        subtotal,
      }, { transaction: t });

      await producto.update({ stock: producto.stock - item.cantidad }, { transaction: t });
    }

    if (mesaId) {
      await Mesa.update({ estado: 'disponible' }, { where: { id: mesaId }, transaction: t });
    }

    await t.commit();

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.status(201).json(ventaCompleta);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: 'Error al crear venta rapida' });
  }
};

const actualizar = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    if (venta.estado !== 'abierta') return res.status(400).json({ error: 'Solo se puede modificar una venta abierta' });

    const { cliente, mesaId } = req.body;
    const datos = {};
    if (cliente !== undefined) datos.cliente = cliente;
    if (mesaId !== undefined) datos.mesaId = mesaId;

    await venta.update(datos);

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.json(ventaCompleta);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar venta' });
  }
};

const cancelar = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    await venta.update({ estado: 'cancelada' });

    if (venta.mesaId) {
      await Mesa.update({ estado: 'disponible' }, { where: { id: venta.mesaId } });
    }

    res.json({ message: 'Venta cancelada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar venta' });
  }
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  agregarProductos,
  cobrar,
  crearRapida,
  actualizar,
  cancelar,
};
