const { Venta, DetalleVenta, Producto, Compra } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { scopeTenant } = require('../utils/tenantScope');

const ventasHoy = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const ventas = await Venta.findAll({
      where: scopeTenant({
        estado: 'cerrada',
        createdAt: { [Op.gte]: hoy, [Op.lt]: manana },
      }, req.tenantId),
    });

    const total = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    res.json({ total, cantidad: ventas.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas del día' });
  }
};

const ventasPorDia = async (req, res) => {
  try {
    const resultados = await Venta.findAll({
      attributes: [
        [sequelize.literal(`DATE("Venta"."createdAt" AT TIME ZONE '-03:00')`), 'dia'],
        [fn('COUNT', col('id')), 'cantidad'],
        [fn('SUM', col('total')), 'total'],
      ],
      where: scopeTenant({ estado: 'cerrada' }, req.tenantId),
      group: [sequelize.literal(`DATE("Venta"."createdAt" AT TIME ZONE '-03:00')`)],
      order: [[sequelize.literal(`DATE("Venta"."createdAt" AT TIME ZONE '-03:00')`), 'DESC']],
      limit: 7,
      raw: true,
    });

    res.json(resultados);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas por día' });
  }
};

const productosMasVendidos = async (req, res) => {
  try {
    const resultados = await DetalleVenta.findAll({
      where: scopeTenant({}, req.tenantId),
      attributes: [
        'ProductoId',
        [fn('SUM', col('cantidad')), 'totalVendido'],
        [fn('SUM', col('subtotal')), 'totalIngresos'],
      ],
      include: [{ model: Producto, attributes: ['nombre'] }],
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
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);

    const compras = await Compra.findAll({
      where: scopeTenant({
        estado: 'recibida',
        fecha: { [Op.gte]: inicioMes, [Op.lt]: finMes },
      }, req.tenantId),
    });

    const total = compras.reduce((sum, c) => sum + Number(c.total), 0);
    res.json({ total, cantidad: compras.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compras del mes' });
  }
};

module.exports = {
  ventasHoy,
  ventasPorDia,
  productosMasVendidos,
  comprasMes,
};
