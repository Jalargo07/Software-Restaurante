import { Request, Response } from 'express';
import { Venta, DetalleVenta, Producto, Compra, Kardex } from '../models';
import { Op, fn, col, literal } from 'sequelize';
import { scopeTenant } from '../utils/tenantScope';

export const ventasHoy = async (req: Request, res: Response) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    const hoy = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

    const desde = (fechaDesde as string) || hoy;
    const hasta = (fechaHasta as string) || hoy;

    const ventas = await Venta.findAll({
      where: scopeTenant({
        estado: 'cerrada',
        createdAt: {
          [Op.gte]: new Date(`${desde}T00:00:00.000Z`),
          [Op.lte]: new Date(`${hasta}T23:59:59.999Z`),
        },
      }, req.tenantId!),
    });

    const total = ventas.reduce((sum, v: any) => sum + Number(v.total), 0);
    return res.json({ total, cantidad: ventas.length, fechaDesde: desde, fechaHasta: hasta });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener ventas del período' });
  }
};

export const ventasPorDia = async (req: Request, res: Response) => {
  try {
    const { dias = 7, fechaDesde, fechaHasta } = req.query;
    let fechasArray: string[] = [];

    if (fechaDesde && fechaHasta) {
      let current = new Date(`${fechaDesde}T00:00:00Z`);
      const end = new Date(`${fechaHasta}T00:00:00Z`);
      while (current <= end) {
        fechasArray.push(current.toISOString().split('T')[0]);
        current.setUTCDate(current.getUTCDate() + 1);
      }
    } else {
      const numDias = parseInt(dias as string, 10) || 7;
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
        }, req.tenantId!),
      });

      const cantidad = ventasDia.length;
      const total = ventasDia.reduce((sum, v: any) => sum + Number(v.total), 0);
      const efectivo = ventasDia
        .filter((v: any) => v.metodoPago === 'efectivo')
        .reduce((sum: number, v: any) => sum + Number(v.total), 0);
      const tarjeta = ventasDia
        .filter((v: any) => v.metodoPago === 'tarjeta')
        .reduce((sum: number, v: any) => sum + Number(v.total), 0);
      const transferencia = ventasDia
        .filter((v: any) => v.metodoPago === 'transferencia')
        .reduce((sum: number, v: any) => sum + Number(v.total), 0);
      resultados.push({ dia: fechaStr, cantidad, total, efectivo, tarjeta, transferencia });
    }

    return res.json(resultados);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener ventas por día' });
  }
};

export const productosMasVendidos = async (req: Request, res: Response) => {
  try {
    const { fechaDesde, fechaHasta, productoIds } = req.query;
    const ventaWhere: any = { estado: 'cerrada' };
    if (fechaDesde && fechaHasta) {
      ventaWhere.createdAt = {
        [Op.gte]: new Date(`${fechaDesde}T00:00:00.000Z`),
        [Op.lte]: new Date(`${fechaHasta}T23:59:59.999Z`),
      };
    }

    const productoWhere: any = {};
    if (productoIds) {
      const ids = (productoIds as string).split(',').map(Number);
      productoWhere.id = { [Op.in]: ids };
    }

    const resultados: any = await DetalleVenta.findAll({
      where: scopeTenant({}, req.tenantId!),
      include: [
        { model: Producto, attributes: ['nombre'], where: Object.keys(productoWhere).length > 0 ? productoWhere : undefined },
        { model: Venta, attributes: [], where: ventaWhere, required: true }
      ],
      attributes: [
        'ProductoId',
        [fn('SUM', col('DetalleVenta.cantidad')), 'totalVendido'],
        [fn('SUM', col('DetalleVenta.subtotal')), 'totalIngresos'],
      ],
      group: ['ProductoId', 'Producto.id'],
      order: [[fn('SUM', col('DetalleVenta.cantidad')), 'DESC']],
      limit: 10,
    });

    const mapeados = resultados.map((r: any) => ({
      productoId: r.ProductoId,
      nombre: r.Producto?.nombre || 'N/A',
      totalVendido: Number(r.getDataValue('totalVendido')),
      totalIngresos: Number(r.getDataValue('totalIngresos')),
    }));

    return res.json(mapeados);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener productos más vendidos' });
  }
};

export const comprasMes = async (req: Request, res: Response) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    const compraWhere: any = { estado: 'recibida' };

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
      where: scopeTenant(compraWhere, req.tenantId!),
    });

    const total = compras.reduce((sum, c: any) => sum + Number(c.total), 0);
    return res.json({ total, cantidad: compras.length });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener compras del período' });
  }
};

export const gananciaBruta = async (req: Request, res: Response) => {
  try {
    const { dias = 7, fechaDesde, fechaHasta } = req.query;
    let fechasArray: string[] = [];

    if (fechaDesde && fechaHasta) {
      let current = new Date(`${fechaDesde}T00:00:00Z`);
      const end = new Date(`${fechaHasta}T00:00:00Z`);
      while (current <= end) {
        fechasArray.push(current.toISOString().split('T')[0]);
        current.setUTCDate(current.getUTCDate() + 1);
      }
    } else {
      const numDias = parseInt(dias as string, 10) || 7;
      for (let i = numDias - 1; i >= 0; i--) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - i);
        fechasArray.push(d.toISOString().split('T')[0]);
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
        }, req.tenantId!),
      });

      const totalVentas = ventasDia.reduce((sum, v: any) => sum + Number(v.total), 0);

      const salidasKardex = await Kardex.findAll({
        where: scopeTenant({
          tipo: 'salida',
          fecha: {
            [Op.gte]: new Date(`${fechaStr}T00:00:00.000Z`),
            [Op.lte]: new Date(`${fechaStr}T23:59:59.999Z`),
          },
        }, req.tenantId!),
      });

      const totalCosto = salidasKardex.reduce((sum, k: any) => sum + Number(k.precioUnitario) * Number(k.cantidad), 0);
      const ganancia = totalVentas - totalCosto;

      resultados.push({ dia: fechaStr, ventas: totalVentas, costo: totalCosto, ganancia });
    }

    return res.json(resultados);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al obtener ganancia bruta' });
  }
};
