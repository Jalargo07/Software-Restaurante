const { Venta, DetalleVenta, Producto, Compra } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const { scopeTenant } = require('../utils/tenantScope');

const ventasHoy = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    const hoy = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

    const desde = fechaDesde || hoy;
    const hasta = fechaHasta || hoy;

    const ventas = await Venta.findAll({
      where: scopeTenant({
        estado: 'cerrada',
        createdAt: {
          [Op.gte]: new Date(`${desde}T00:00:00.000Z`),
          [Op.lte]: new Date(`${hasta}T23:59:59.999Z`),
        },
      }, req.tenantId),
    });

    const total = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    res.json({ total, cantidad: ventas.length, fechaDesde: desde, fechaHasta: hasta });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas del período' });
  }
};

const ventasPorDia = async (req, res) => {
  try {
    const { dias = 7, fechaDesde, fechaHasta } = req.query;
    let fechasArray = [];

    if (fechaDesde && fechaHasta) {
      let current = new Date(`${fechaDesde}T00:00:00Z`);
      const end = new Date(`${fechaHasta}T00:00:00Z`);
      while (current <= end) {
        fechasArray.push(current.toISOString().split('T')[0]);
        current.setUTCDate(current.getUTCDate() + 1);
      }
    } else {
      const numDias = parseInt(dias, 10) || 7;
      for (let i = numDias - 1; i >= 0; i--) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - i);
        const fechaStr = d.toISOString().split('T')[0];
        fechasArray.push(fechaStr);
      }
    }

    const resultados = [];
    for (const fechaStr of fechasArray) {
      const ventasDia = await Venta.findAll({
        where: scopeTenant({
          estado: 'cerrada',
          createdAt: {
            [Op.gte]: new Date(`${fechaStr}T00:00:00.000Z`),
            [Op.lte]: new Date(`${fechaStr}T23:59:59.999Z`),
          },
        }, req.tenantId),
      });

      const cantidad = ventasDia.length;
      const total = ventasDia.reduce((sum, v) => sum + Number(v.total), 0);
      resultados.push({ dia: fechaStr, cantidad, total });
    }

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas por día' });
  }
};

const productosMasVendidos = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    const ventaWhere = { estado: 'cerrada' };
    if (fechaDesde && fechaHasta) {
      ventaWhere.createdAt = {
        [Op.gte]: new Date(`${fechaDesde}T00:00:00.000Z`),
        [Op.lte]: new Date(`${fechaHasta}T23:59:59.999Z`),
      };
    }

    const resultados = await DetalleVenta.findAll({
      where: scopeTenant({}, req.tenantId),
      include: [
        { model: Producto, attributes: ['nombre'] },
        { model: Venta, attributes: [], where: ventaWhere, required: true }
      ],
      attributes: [
        'ProductoId',
        [fn('SUM', col('DetalleVenta.cantidad')), 'totalVendido'],
        [fn('SUM', col('DetalleVenta.subtotal')), 'totalIngresos'],
      ],
      group: ['ProductoId', 'Producto.id'],
      order: [[literal('totalVendido'), 'DESC']],
      limit: 10,
    });

    const mapeados = resultados.map((r) => ({
      productoId: r.ProductoId,
      nombre: r.Producto?.nombre || 'N/A',
      totalVendido: Number(r.getDataValue('totalVendido')),
      totalIngresos: Number(r.getDataValue('totalIngresos')),
    }));

    res.json(mapeados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos más vendidos' });
  }
};

const comprasMes = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    const compraWhere = { estado: 'recibida' };

    if (fechaDesde && fechaHasta) {
      compraWhere.fecha = {
        [Op.gte]: new Date(`${fechaDesde}T00:00:00.000Z`),
        [Op.lte]: new Date(`${fechaHasta}T23:59:59.999Z`),
      };
    } else {
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);
      compraWhere.fecha = { [Op.gte]: inicioMes, [Op.lt]: finMes };
    }

    const compras = await Compra.findAll({
      where: scopeTenant(compraWhere, req.tenantId),
    });

    const total = compras.reduce((sum, c) => sum + Number(c.total), 0);
    res.json({ total, cantidad: compras.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compras del período' });
  }
};

module.exports = {
  ventasHoy,
  ventasPorDia,
  productosMasVendidos,
  comprasMes,
};
