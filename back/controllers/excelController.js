const ExcelJS = require('exceljs');
const { Venta, DetalleVenta, Producto, Compra, DetalleCompra, Proveedor } = require('../models');
const { Op } = require('sequelize');

const reporteVentasExcel = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    const where = { estado: 'cerrada' };
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) where.createdAt[Op.gte] = new Date(fechaDesde);
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      where.createdAt[Op.lte] = hasta;
      }
    }

    const ventas = await Venta.findAll({
      where,
      include: [{ model: DetalleVenta, include: [Producto] }],
      order: [['createdAt', 'DESC']],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Restaurante';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Ventas', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Fecha', key: 'fecha', width: 22 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Método Pago', key: 'metodoPago', width: 18 },
      { header: 'Productos', key: 'productos', width: 45 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
    headerRow.alignment = { horizontal: 'center' };

    let totalGeneral = 0;

    for (const venta of ventas) {
      const productosLista = venta.DetalleVentas
        .map((d) => `${d.Producto?.nombre || 'N/A'} x${d.cantidad}`)
        .join(', ');

      const row = sheet.addRow({
        id: venta.id,
        fecha: new Date(venta.createdAt).toLocaleString('es-AR'),
        cliente: venta.cliente || 'Sin cliente',
        metodoPago: venta.metodoPago || 'N/A',
        productos: productosLista,
        subtotal: Number(venta.total),
        total: Number(venta.total),
      });

      row.getCell('subtotal').numFmt = '#,##0.00';
      row.getCell('total').numFmt = '#,##0.00';
      totalGeneral += Number(venta.total);
    }

    const totalRow = sheet.addRow({});
    sheet.addRow({});
    const summaryRow = sheet.addRow({
      id: '',
      fecha: '',
      cliente: '',
      metodoPago: '',
      productos: `Total: ${ventas.length} ventas`,
      subtotal: '',
      total: totalGeneral,
    });
    summaryRow.font = { bold: true, size: 12 };
    summaryRow.getCell('total').numFmt = '#,##0.00';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar ventas:', error);
    res.status(500).json({ error: 'Error al exportar reporte de ventas' });
  }
};

const reporteComprasExcel = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;

    const where = {};
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha[Op.gte] = new Date(fechaDesde);
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      where.fecha[Op.lte] = hasta;
      }
    }

    const compras = await Compra.findAll({
      where,
      include: [
        { model: DetalleCompra, include: [Producto] },
        { model: Proveedor },
      ],
      order: [['fecha', 'DESC']],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Restaurante';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Compras', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Fecha', key: 'fecha', width: 22 },
      { header: 'Proveedor', key: 'proveedor', width: 25 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Productos', key: 'productos', width: 45 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
    headerRow.alignment = { horizontal: 'center' };

    let totalGeneral = 0;

    for (const compra of compras) {
      const productosLista = compra.DetalleCompras
        .map((d) => `${d.Producto?.nombre || 'N/A'} x${d.cantidad}`)
        .join(', ');

      const row = sheet.addRow({
        id: compra.id,
        fecha: new Date(compra.fecha).toLocaleString('es-AR'),
        proveedor: compra.Proveedor?.nombre || 'N/A',
        estado: compra.estado,
        productos: productosLista,
        total: Number(compra.total),
      });

      row.getCell('total').numFmt = '#,##0.00';
      totalGeneral += Number(compra.total);
    }

    const summaryRow = sheet.addRow({
      id: '',
      fecha: '',
      proveedor: '',
      estado: '',
      productos: `Total: ${compras.length} compras`,
      total: totalGeneral,
    });
    summaryRow.font = { bold: true, size: 12 };
    summaryRow.getCell('total').numFmt = '#,##0.00';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_compras.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar compras:', error);
    res.status(500).json({ error: 'Error al exportar reporte de compras' });
  }
};

const reporteAuditoriaExcel = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta, usuario, entidad } = req.query;
    const { Auditoria } = require('../models');

    const where = {};
    if (usuario) {
      where.usuarioEmail = { [Op.like]: `%${usuario}%` };
    }
    if (entidad) {
      where.entidad = entidad;
    }
    if (fechaDesde || fechaHasta) {
      where.createdAt = {};
      if (fechaDesde) where.createdAt[Op.gte] = new Date(fechaDesde);
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = hasta;
      }
    }

    const logs = await Auditoria.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Restaurante';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Auditoría', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Fecha', key: 'fecha', width: 22 },
      { header: 'Usuario', key: 'usuario', width: 25 },
      { header: 'Acción', key: 'accion', width: 20 },
      { header: 'Entidad', key: 'entidad', width: 20 },
      { header: 'ID Entidad', key: 'entidadId', width: 12 },
      { header: 'Detalles', key: 'detalles', width: 50 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
    headerRow.alignment = { horizontal: 'center' };

    for (const log of logs) {
      let detallesStr = '-';
      if (log.detalles) {
        try {
          detallesStr = typeof log.detalles === 'string' ? log.detalles : JSON.stringify(log.detalles);
        } catch {
          detallesStr = String(log.detalles);
        }
      }

      sheet.addRow({
        id: log.id,
        fecha: new Date(log.createdAt).toLocaleString('es-AR'),
        usuario: log.usuarioEmail || '-',
        accion: log.accion,
        entidad: log.entidad,
        entidadId: log.entidadId || '-',
        detalles: detallesStr,
      });
    }

    const summaryRow = sheet.addRow({
      id: '',
      fecha: '',
      usuario: '',
      accion: '',
      entidad: '',
      entidadId: '',
      detalles: `Total: ${logs.length} registros`,
    });
    summaryRow.font = { bold: true, size: 12 };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_auditoria.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar auditoría:', error);
    res.status(500).json({ error: 'Error al exportar reporte de auditoría' });
  }
};

module.exports = {
  reporteVentasExcel,
  reporteComprasExcel,
  reporteAuditoriaExcel,
};
