import { Request, Response } from 'express';
import { Tenant, TenantConfig, Producto } from '../models';

export const getPublicMenu = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const tenant: any = await Tenant.findOne({
      where: { slug, activo: true },
      include: [{ model: TenantConfig }],
    });

    if (!tenant) return res.status(404).json({ error: 'Restaurante no encontrado' });

    const productos = await Producto.findAll({
      where: { tenant_id: tenant.id, activo: true },
      attributes: ['id', 'nombre', 'descripcion', 'categoria', 'tipo', 'precioVenta', 'imagen', 'unidad'],
      order: [['categoria', 'ASC'], ['nombre', 'ASC']],
    });

    res.json({
      tenant: {
        nombre: tenant.nombre,
        slug: tenant.slug,
        logo: tenant.TenantConfig?.logo || null,
        colorPrimario: tenant.TenantConfig?.colorPrimario || '#2563eb',
        colorSecundario: tenant.TenantConfig?.colorSecundario || '#1e40af',
      },
      productos,
    });
  } catch (error: any) {
    console.error('Error en getPublicMenu:', error);
    res.status(500).json({ error: 'Error al obtener menú' });
  }
};
