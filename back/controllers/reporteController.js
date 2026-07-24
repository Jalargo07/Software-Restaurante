const { Venta, DetalleVenta, Producto, Compra } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const { scopeTenant } = require('../utils/tenantScope');

const ventasHoy = async (req, res) => {
  try {
    const hoy = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

    const ventas = await Venta.findAll({
      where: scopeTenant({
        estado: 'cerrada',
        createdAt: {
          [Op.gte]: new Date(`${hoy}T00:00:00`),
          [Op.lte]: new Date(`${hoy}T23:59:59`),
        },
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
    const resultados = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const fechaStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

      const ventasDia = await Venta.findAll({
        where: scopeTenant({
          estado: 'cerrada',
          createdAt: {
            [Op.gte]: new Date(`${fechaStr}T00:00:00`),
            [Op.lte]: new Date(`${fechaStr}T23:59:59`),
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
