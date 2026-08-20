import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import { Venta, DetalleVenta, DetalleCompra, Producto, Compra, Kardex, Proveedor } from '../models';
import { Op, fn, col } from 'sequelize';
import { scopeTenant } from '../utils/tenantScope';
import { obtenerForecast } from '../services/demandForecast';

export const ventasHoy = async (req: Request, res: Response) => {
  try {
    const { fechaDesde, fechaHasta, productoIds } = req.query;
    const hoy = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

    const desde = (fechaDesde as string) || hoy;
    const hasta = (fechaHasta as string) || hoy;

    const ventaWhere: any = {
      estado: 'cerrada',
      createdAt: {
        [Op.gte]: new Date(`${desde}T00:00:00.000Z`),
        [Op.lte]: new Date(`${hasta}T23:59:59.999Z`),
      },
    };

    if (productoIds) {
      const ids = (productoIds as string).split(',').map(Number).filter(n => !isNaN(n));
      if (ids.length > 0) {
        const detalles = await DetalleVenta.findAll({
          attributes: ['VentaId'],
          where: { ProductoId: { [Op.in]: ids }, tenant_id: req.tenantId },
          raw: true,
        });
        const ventaIds = [...new Set(detalles.map((d: any) => d.VentaId))];
        if (ventaIds.length === 0) {
          return res.json({ total: 0, cantidad: 0, fechaDesde: desde, fechaHasta: hasta });
        }
        ventaWhere.id = { [Op.in]: ventaIds };
      }
    }

    const ventas = await Venta.findAll({
      where: scopeTenant(ventaWhere, req.tenantId!),
    });

    const total = ventas.reduce((sum, v: any) => sum + Number(v.total), 0);
    return res.json({ total, cantidad: ventas.length, fechaDesde: desde, fechaHasta: hasta });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener ventas del período' });
  }
};

async function getVentasYGananciaAgrupadas(
  tenantId: number,
  params: { dias?: string; fechaDesde?: string; fechaHasta?: string; productoIds?: string }
) {
  const { dias = '7', fechaDesde, fechaHasta, productoIds } = params;
  let fechasArray: string[] = [];

  const ids: number[] = productoIds
    ? productoIds.split(',').map(Number).filter(n => !isNaN(n))
    : [];

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
      fechasArray.push(d.toISOString().split('T')[0]);
    }
  }

  let ventaIdsFiltradas: number[] = [];
  if (ids.length > 0) {
    const detalles = await DetalleVenta.findAll({
      attributes: ['VentaId'],
      where: { ProductoId: { [Op.in]: ids }, tenant_id: tenantId },
      raw: true,
    });
    ventaIdsFiltradas = [...new Set(detalles.map((d: any) => d.VentaId))];
    if (ventaIdsFiltradas.length === 0) {
      return {
        ventasPorDia: fechasArray.map(f => ({ dia: f, cantidad: 0, total: 0, efectivo: 0, tarjeta: 0, transferencia: 0 })),
        gananciaBruta: fechasArray.map(f => ({ dia: f, ventas: 0, costo: 0, ganancia: 0 })),
      };
    }
  }

  const desde = fechasArray[0];
  const hasta = fechasArray[fechasArray.length - 1];

  const ventaWhere: any = {
    estado: 'cerrada',
    createdAt: {
      [Op.gte]: new Date(`${desde}T00:00:00.000Z`),
      [Op.lte]: new Date(`${hasta}T23:59:59.999Z`),
    },
  };

  if (ventaIdsFiltradas.length > 0) {
    ventaWhere.id = { [Op.in]: ventaIdsFiltradas };
  }

  const ventas = await Venta.findAll({
    where: scopeTenant(ventaWhere, tenantId),
  });

  const kardexWhere: any = {
    tipo: 'salida',
    fecha: {
      [Op.gte]: new Date(`${desde}T00:00:00.000Z`),
      [Op.lte]: new Date(`${hasta}T23:59:59.999Z`),
    },
  };

  if (ids.length > 0) {
    kardexWhere.productoId = { [Op.in]: ids };
  }

  const salidasKardex = await Kardex.findAll({
    where: scopeTenant(kardexWhere, tenantId),
  });

  const ventasPorDia = fechasArray.map(fechaStr => {
    const ventasDia = ventas.filter((v: any) => {
      const vDate = new Date(v.createdAt).toISOString().split('T')[0];
      return vDate === fechaStr;
    });

    return {
      dia: fechaStr,
      cantidad: ventasDia.length,
      total: ventasDia.reduce((sum: number, v: any) => sum + Number(v.total), 0),
      efectivo: ventasDia.filter((v: any) => v.metodoPago === 'efectivo').reduce((sum: number, v: any) => sum + Number(v.total), 0),
      tarjeta: ventasDia.filter((v: any) => v.metodoPago === 'tarjeta').reduce((sum: number, v: any) => sum + Number(v.total), 0),
      transferencia: ventasDia.filter((v: any) => v.metodoPago === 'transferencia').reduce((sum: number, v: any) => sum + Number(v.total), 0),
    };
  });

  const gananciaBruta = fechasArray.map(fechaStr => {
    const salidasDia = salidasKardex.filter((k: any) => {
      const kDate = new Date(k.fecha).toISOString().split('T')[0];
      return kDate === fechaStr;
    });

    const ventasDia = ventas.filter((v: any) => {
      const vDate = new Date(v.createdAt).toISOString().split('T')[0];
      return vDate === fechaStr;
    });

    const totalVentas = ventasDia.reduce((sum: number, v: any) => sum + Number(v.total), 0);
    const totalCosto = salidasDia.reduce((sum: number, k: any) => sum + Number(k.precioUnitario) * Number(k.cantidad), 0);

    return { dia: fechaStr, ventas: totalVentas, costo: totalCosto, ganancia: totalVentas - totalCosto };
  });

  return { ventasPorDia, gananciaBruta };
}

export const ventasPorDia = async (req: Request, res: Response) => {
  try {
    const { dias, fechaDesde, fechaHasta, productoIds } = req.query;
    const result = await getVentasYGananciaAgrupadas(req.tenantId!, {
      dias: dias as string,
      fechaDesde: fechaDesde as string,
      fechaHasta: fechaHasta as string,
      productoIds: productoIds as string,
    });
    return res.json(result.ventasPorDia);
  } catch (error: any) {
    console.error(error);
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
      const ids = (productoIds as string).split(',').map(Number).filter(n => !isNaN(n));
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
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener productos más vendidos' });
  }
};

export const comprasMes = async (req: Request, res: Response) => {
  try {
    const { fechaDesde, fechaHasta, productoIds } = req.query;
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

    if (productoIds) {
      const ids = (productoIds as string).split(',').map(Number).filter(n => !isNaN(n));
      if (ids.length > 0) {
        const detalles = await DetalleCompra.findAll({
          attributes: ['CompraId'],
          where: { ProductoId: { [Op.in]: ids }, tenant_id: req.tenantId },
          raw: true,
        });
        const compraIds = [...new Set(detalles.map((d: any) => d.CompraId))];
        if (compraIds.length === 0) {
          return res.json({ total: 0, cantidad: 0 });
        }
        compraWhere.id = { [Op.in]: compraIds };
      }
    }

    const compras = await Compra.findAll({
      where: scopeTenant(compraWhere, req.tenantId!),
    });

    const total = compras.reduce((sum, c: any) => sum + Number(c.total), 0);
    return res.json({ total, cantidad: compras.length });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener compras del período' });
  }
};

export const gananciaBruta = async (req: Request, res: Response) => {
  try {
    const { dias, fechaDesde, fechaHasta, productoIds } = req.query;
    const result = await getVentasYGananciaAgrupadas(req.tenantId!, {
      dias: dias as string,
      fechaDesde: fechaDesde as string,
      fechaHasta: fechaHasta as string,
      productoIds: productoIds as string,
    });
    return res.json(result.gananciaBruta);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener ganancia bruta' });
  }
};

export const obtenerCOGS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    const whereVenta: any = {
      tenantId: req.tenantId,
      estado: 'cerrada'
    };

    if (fechaDesde || fechaHasta) {
      whereVenta.createdAt = {};
      if (fechaDesde) whereVenta.createdAt.gte = new Date(fechaDesde as string);
      if (fechaHasta) whereVenta.createdAt.lte = new Date(fechaHasta as string);
    }

    const ventas = await Venta.findAll({ where: whereVenta });

    let totalVentas = 0;
    let totalCostos = 0;

    for (const venta of ventas) {
      const v = venta as any;
      totalVentas += parseFloat(v.total.toString());

      const detalles = await DetalleVenta.findAll({
        where: { ventaId: v.id, tenantId: req.tenantId }
      });

      for (const detalle of detalles) {
        const d = detalle as any;
        const kardexSalida = await Kardex.findOne({
          where: {
            productoId: d.productoId,
            tenantId: req.tenantId,
            tipo: 'salida'
          },
          order: [['fecha', 'DESC']]
        });

        if (kardexSalida) {
          const k = kardexSalida as any;
          totalCostos += parseFloat(k.precioUnitario.toString()) * d.cantidad;
        }
      }
    }

    const cogsPorcentaje = totalVentas > 0 ? (totalCostos / totalVentas) * 100 : 0;

    return res.json({
      ok: true,
      totalVentas,
      totalCostos,
      cogsPorcentaje: Math.round(cogsPorcentaje * 100) / 100,
      gananciaBruta: totalVentas - totalCostos,
      margenPorcentaje: totalVentas > 0 ? ((totalVentas - totalCostos) / totalVentas) * 100 : 0
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerForecastHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dias } = req.query;
    const forecast = await obtenerForecast(req.tenantId!, parseInt(dias as string) || 7);
    res.json({ ok: true, forecast });
  } catch (error) {
    next(error);
  }
};

export const obtenerHeatmap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productoId } = req.query;

    const { DetalleVenta, Venta } = await import('../models');

    const where: any = {
      tenantId: req.tenantId
    };

    if (productoId) {
      where.productoId = parseInt(productoId as string);
    }

    const detalles = await DetalleVenta.findAll({
      where,
      include: [{
        model: Venta,
        where: { estado: 'cerrada', tenantId: req.tenantId },
        required: true
      }]
    });

    const matrix: number[][] = Array.from({ length: 7 }, () => Array(17).fill(0));

    for (const detalle of detalles) {
      const d = detalle as any;
      const venta = d.Venta;
      const hora = new Date(venta.createdAt).getHours();
      const dia = new Date(venta.createdAt).getDay();

      if (hora >= 6 && hora <= 22) {
        matrix[dia][hora - 6] += d.cantidad;
      }
    }

    res.json({
      ok: true,
      horas: Array.from({ length: 17 }, (_, i) => i + 6),
      dias: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      matrix
    });
  } catch (error) {
    next(error);
  }
};

export const exportarStockBajoPDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { Producto, Proveedor, Compra, DetalleCompra } = await import('../models');

    const productos = await Producto.findAll({
      where: {
        tenantId: req.tenantId,
        activo: true,
        tipo: 'insumo'
      }
    });

    const productosBajoStock = (productos as any[]).filter((p: any) => p.stock <= p.stockMinimo);

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=stock-bajo.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Reporte de Stock Bajo', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text('Producto', 50, 150, { width: 150 });
    doc.text('Stock', 200, 150, { width: 80 });
    doc.text('Mín', 280, 150, { width: 80 });
    doc.text('Proveedor', 360, 150, { width: 150 });
    doc.text('Última Compra', 510, 150, { width: 100 });

    doc.moveTo(50, 165).lineTo(610, 165).stroke();

    let y = 175;
    for (const producto of productosBajoStock) {
      const prod = producto as any;
      const ultimaCompra = await Compra.findOne({
        where: { tenantId: req.tenantId, estado: 'recibida' },
        include: [{
          model: DetalleCompra,
          where: { productoId: prod.id },
          required: true
        }],
        order: [['createdAt', 'DESC']]
      });

      let proveedorNombre = 'N/A';
      let ultimaFecha = 'N/A';

      if (ultimaCompra) {
        const detalle = (ultimaCompra as any).DetalleCompras?.[0];
        if (detalle) {
          proveedorNombre = (detalle as any).Proveedor?.nombre || 'N/A';
          ultimaFecha = new Date((ultimaCompra as any).createdAt).toLocaleDateString();
        }
      }

      doc.text(prod.nombre, 50, y, { width: 150 });
      doc.text(prod.stock.toString(), 200, y, { width: 80 });
      doc.text(prod.stockMinimo.toString(), 280, y, { width: 80 });
      doc.text(proveedorNombre, 360, y, { width: 150 });
      doc.text(ultimaFecha, 510, y, { width: 100 });

      y += 20;

      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};
