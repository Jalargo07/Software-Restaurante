import { Auditoria } from '../models';

export const registrarAuditoria = async ({ req, accion, entidad, entidadId, detalles }: { req: any; accion: string; entidad: string; entidadId?: any; detalles?: any }) => {
  try {
    await Auditoria.create({
      tenant_id: req?.tenantId || req?.user?.tenant_id || 1,
      usuarioId: req?.user?.id || null,
      usuarioEmail: req?.user?.email || null,
      accion,
      entidad,
      entidadId: entidadId || null,
      detalles: detalles || null,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (error: any) {
    console.error('Error al registrar auditoría:', error.message);
  }
};

export default registrarAuditoria;
