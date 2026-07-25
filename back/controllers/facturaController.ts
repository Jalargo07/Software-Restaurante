import { Request, Response } from 'express';
import { DocumentoFiscal, Venta, TenantConfig, Tenant } from '../models';
import { crearFacturador } from '../services/facturador';

export const timbrar = async (req: Request, res: Response) => {
  try {
    const { ventaId } = req.params;
    const tenantId = req.tenantId!;

    let doc: any = await DocumentoFiscal.findOne({ where: { ventaId, tenant_id: tenantId } });
    if (!doc) {
      const venta: any = await Venta.findByPk(ventaId as string);
      if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
      doc = await DocumentoFiscal.create({
        tenant_id: tenantId,
        ventaId,
        tipo: 'boleta',
        estado: 'pendiente',
        montoNeto: Number((venta.total / 1.19).toFixed(2)),
        iva: Number(((venta.total * 0.19) / 1.19).toFixed(2)),
        montoTotal: venta.total,
      });
    }

    if (doc.estado === 'timbrado') return res.json({ message: 'Documento ya timbrado', documento: doc });

    const config: any = await TenantConfig.findOne({ where: { tenant_id: tenantId } });
    const pais = config?.pais || 'chile';
    const facturador = crearFacturador(pais);
    const resultado = await facturador.timbrar(doc, config || {});

    if (resultado.exito) {
      doc.estado = 'timbrado';
      doc.folio = resultado.folio;
      doc.timbre = resultado.timbre;
      doc.fechaTimbre = resultado.fechaTimbre;
      doc.xml = resultado.xml;
      doc.respuestaSii = resultado;
      await doc.save();
      return res.json({ message: 'Documento timbrado exitosamente', documento: doc });
    }
    doc.estado = 'rechazado';
    doc.respuestaSii = resultado;
    await doc.save();
    return res.status(400).json({ error: resultado.error || 'Error al timbrar', documento: doc });
  } catch (error: any) {
    console.error('Error en timbrar:', error);
    return res.status(500).json({ error: 'Error al timbrar documento' });
  }
};

export const obtenerPorVenta = async (req: Request, res: Response) => {
  try {
    const doc = await DocumentoFiscal.findOne({ where: { ventaId: req.params.ventaId, tenant_id: req.tenantId! } });
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(doc);
  } catch (error: any) {
    console.error('Error en obtenerPorVenta:', error);
    res.status(500).json({ error: 'Error al obtener documento' });
  }
};

export const listar = async (req: Request, res: Response) => {
  try {
    const docs = await DocumentoFiscal.findAll({
      where: { tenant_id: req.tenantId! },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json(docs);
  } catch (error: any) {
    console.error('Error en listar:', error);
    res.status(500).json({ error: 'Error al listar documentos' });
  }
};

export const reintentar = async (req: Request, res: Response) => {
  try {
    const doc: any = await DocumentoFiscal.findOne({ where: { id: req.params.id as string, tenant_id: req.tenantId! } });
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    if (doc.estado === 'timbrado') return res.json({ message: 'Documento ya timbrado', documento: doc });

    const config: any = await TenantConfig.findOne({ where: { tenant_id: req.tenantId! } });
    const facturador = crearFacturador(config?.pais || 'chile');
    const resultado = await facturador.timbrar(doc, config || {});

    if (resultado.exito) {
      doc.estado = 'timbrado';
      doc.folio = resultado.folio;
      doc.timbre = resultado.timbre;
      doc.fechaTimbre = resultado.fechaTimbre;
      doc.xml = resultado.xml;
      doc.respuestaSii = resultado;
      await doc.save();
      return res.json({ message: 'Documento timbrado exitosamente', documento: doc });
    }
    return res.status(400).json({ error: resultado.error || 'Error al timbrar', documento: doc });
  } catch (error: any) {
    console.error('Error en reintentar:', error);
    res.status(500).json({ error: 'Error al reintentar timbraje' });
  }
};
