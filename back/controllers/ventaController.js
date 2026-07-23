const { Venta, DetalleVenta, Producto, Mesa, Receta, DetalleReceta } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const { registrarAuditoria } = require('../utils/auditoria');

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
        const producto = detalle.Producto;

        if (producto.tipo === 'compuesto') {
          const receta = await Receta.findOne({
            where: { productoId: producto.id },
            transaction: t,
          });

          if (!receta) {
            await t.rollback();
            return res.status(400).json({ error: `El producto compuesto "${producto.nombre}" no tiene receta definida` });
          }

          const ingredientes = await DetalleReceta.findAll({
            where: { recetaId: receta.id },
            transaction: t,
          });

          for (const ingrediente of ingredientes) {
            const insumo = await Producto.findByPk(ingrediente.insumoId, { transaction: t });
            if (!insumo) {
              await t.rollback();
              return res.status(400).json({ error: `Insumo id ${ingrediente.insumoId} no encontrado en receta` });
            }

            const cantidadNecesaria = Number(ingrediente.cantidad) * Number(detalle.cantidad);
            const mermaFactor = 1 + Number(ingrediente.merma) / 100;
            const totalRequerido = Math.ceil(cantidadNecesaria * mermaFactor);

            if (insumo.stock < totalRequerido) {
              await t.rollback();
              return res.status(400).json({
                error: `Stock insuficiente de "${insumo.nombre}": necesita ${totalRequerido}, disponible ${insumo.stock}`,
              });
            }

            await insumo.update({ stock: insumo.stock - totalRequerido }, { transaction: t });
          }
        } else {
          if (Number(producto.stock) < Number(detalle.cantidad)) {
            await t.rollback();
            return res.status(400).json({
              error: `Stock insuficiente de "${producto.nombre}": necesitás ${detalle.cantidad}, tenés ${producto.stock}`,
            });
          }
          const nuevoStock = producto.stock - detalle.cantidad;
          await producto.update({ stock: nuevoStock }, { transaction: t });
        }
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

    await registrarAuditoria({
      req,
      accion: 'cobrar',
      entidad: 'Venta',
      entidadId: venta.id,
      detalles: { total: Number(venta.total), metodoPago },
    });

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

      if (producto.tipo === 'compuesto') {
        const receta = await Receta.findOne({
          where: { productoId: producto.id },
          transaction: t,
        });

        if (!receta) {
          await t.rollback();
          return res.status(400).json({ error: `El producto compuesto "${producto.nombre}" no tiene receta definida` });
        }

        const ingredientes = await DetalleReceta.findAll({
          where: { recetaId: receta.id },
          transaction: t,
        });

        for (const ingrediente of ingredientes) {
          const insumo = await Producto.findByPk(ingrediente.insumoId, { transaction: t });
          if (!insumo) {
            await t.rollback();
            return res.status(400).json({ error: `Insumo id ${ingrediente.insumoId} no encontrado en receta` });
          }

          const cantidadNecesaria = Number(ingrediente.cantidad) * Number(item.cantidad);
          const mermaFactor = 1 + Number(ingrediente.merma) / 100;
          const totalRequerido = Math.ceil(cantidadNecesaria * mermaFactor);

          if (insumo.stock < totalRequerido) {
            await t.rollback();
            return res.status(400).json({
              error: `Stock insuficiente de "${insumo.nombre}": necesita ${totalRequerido}, disponible ${insumo.stock}`,
            });
          }

          await insumo.update({ stock: insumo.stock - totalRequerido }, { transaction: t });
        }
      } else {
        if (Number(producto.stock) < Number(item.cantidad)) {
          await t.rollback();
          return res.status(400).json({
            error: `Stock insuficiente de "${producto.nombre}": necesitás ${item.cantidad}, tenés ${producto.stock}`,
          });
        }
        await producto.update({ stock: producto.stock - item.cantidad }, { transaction: t });
      }
    }

    if (mesaId) {
      await Mesa.update({ estado: 'disponible' }, { where: { id: mesaId }, transaction: t });
    }

    await t.commit();

    await registrarAuditoria({
      req,
      accion: 'crear_rapida',
      entidad: 'Venta',
      entidadId: venta.id,
      detalles: { total, metodoPago, cantidadProductos: productos.length },
    });

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

    await registrarAuditoria({
      req,
      accion: 'cancelar',
      entidad: 'Venta',
      entidadId: venta.id,
      detalles: { total: Number(venta.total) },
    });

    res.json({ message: 'Venta cancelada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar venta' });
  }
};

const actualizarDetalle = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    if (venta.estado !== 'abierta') return res.status(400).json({ error: 'Solo se puede modificar una venta abierta' });

    const detalle = await DetalleVenta.findByPk(req.params.detalleId);
    if (!detalle) return res.status(404).json({ error: 'Detalle no encontrado' });
    if (detalle.VentaId !== venta.id) return res.status(400).json({ error: 'El detalle no pertenece a esta venta' });

    const { cantidad } = req.body;
    const subtotal = cantidad * Number(detalle.precioUnitario);

    await detalle.update({ cantidad, subtotal });

    const detalles = await DetalleVenta.findAll({ where: { VentaId: venta.id } });
    const nuevoTotal = detalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
    await venta.update({ total: nuevoTotal });

    await registrarAuditoria({
      req,
      accion: 'actualizar_detalle',
      entidad: 'DetalleVenta',
      entidadId: detalle.id,
      detalles: { cantidad, subtotal, ventaId: venta.id },
    });

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.json(ventaCompleta);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar detalle' });
  }
};

const eliminarDetalle = async (req, res) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    if (venta.estado !== 'abierta') return res.status(400).json({ error: 'Solo se puede modificar una venta abierta' });

    const detalle = await DetalleVenta.findByPk(req.params.detalleId);
    if (!detalle) return res.status(404).json({ error: 'Detalle no encontrado' });
    if (detalle.VentaId !== venta.id) return res.status(400).json({ error: 'El detalle no pertenece a esta venta' });

    const count = await DetalleVenta.count({ where: { VentaId: venta.id } });
    if (count <= 1) return res.status(400).json({ error: 'No se puede eliminar el último detalle de la venta' });

    const datosAnteriores = { cantidad: detalle.cantidad, subtotal: Number(detalle.subtotal), ProductoId: detalle.ProductoId };

    await detalle.destroy();

    const detalles = await DetalleVenta.findAll({ where: { VentaId: venta.id } });
    const nuevoTotal = detalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
    await venta.update({ total: nuevoTotal });

    await registrarAuditoria({
      req,
      accion: 'eliminar_detalle',
      entidad: 'DetalleVenta',
      entidadId: detalle.id,
      detalles: { ...datosAnteriores, ventaId: venta.id },
    });

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: DetalleVenta, include: [Producto] }, Mesa],
    });

    res.json(ventaCompleta);
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar detalle' });
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
  actualizarDetalle,
  eliminarDetalle,
};
