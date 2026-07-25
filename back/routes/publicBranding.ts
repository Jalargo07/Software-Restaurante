import { Router } from 'express';
import { getPublicBranding } from '../controllers/brandingController';
import { Tenant, TenantConfig } from '../models';

const router = Router();

router.get('/branding/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.findAll({
      where: { activo: true, estado: 'activo' },
      include: [{ model: TenantConfig, required: false }],
      attributes: ['id', 'nombre', 'slug'],
      order: [['nombre', 'ASC']],
    });

    const result = tenants.map((t: any) => ({
      id: t.id,
      nombre: t.nombre,
      slug: t.slug,
      logo: t.TenantConfig?.logo || null,
    }));

    return res.json(result);
  } catch (error) {
    console.error('Error al obtener tenants públicos:', error);
    return res.status(500).json({ error: 'Error al obtener lista de restaurantes' });
  }
});

router.get('/branding/:slug', getPublicBranding);

export default router;
