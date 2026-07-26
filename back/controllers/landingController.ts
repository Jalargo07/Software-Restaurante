import { Request, Response } from 'express';
import { LandingContent } from '../models';

export const getPublicLanding = async (_req: Request, res: Response) => {
  try {
    const landing = await LandingContent.findOne();
    if (!landing) return res.json({ data: null });
    res.json((landing as any).data);
  } catch (error: any) {
    console.error('Error en getPublicLanding:', error);
    res.status(500).json({ error: 'Error al obtener contenido' });
  }
};

export const getLanding = async (_req: Request, res: Response) => {
  try {
    const landing = await LandingContent.findOne();
    if (!landing) return res.json({ data: getDefaultData() });
    res.json(landing);
  } catch (error: any) {
    console.error('Error en getLanding:', error);
    res.status(500).json({ error: 'Error al obtener contenido' });
  }
};

export const updateLanding = async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'data requerido' });

    let landing = await LandingContent.findOne();
    if (landing) {
      (landing as any).data = data;
      await landing.save();
    } else {
      landing = await LandingContent.create({ data });
    }

    res.json(landing);
  } catch (error: any) {
    console.error('Error en updateLanding:', error);
    res.status(500).json({ error: 'Error al actualizar contenido' });
  }
};

export function getDefaultData() {
  return {
    hero: {
      logo: '/logo-biteops.webp',
      titulo: 'El sistema operativo',
      tituloGradiente: 'de tu restaurante',
      subtitulo: 'Gestioná tu restaurante desde un solo lugar: POS, inventario, comandas, reportes y menú digital.',
      ctaPrincipal: { texto: 'Comenzar gratis', link: '/login' },
      ctaSecundario: { texto: 'Ver demo', link: '#demo' },
    },
    problem: {
      titulo: '¿Cansado del caos?',
      subtitulo: 'Los restaurantes sin un sistema digital pierden tiempo, plata y clientes.',
      items: [
        { icon: '📝', titulo: 'Pedidos perdidos', descripcion: 'Comandas en papel que se extravían en la cocina' },
        { icon: '📉', titulo: 'Inventario descontrolado', descripcion: 'Sin saber qué ingredientes tenés ni cuándo se vencen' },
        { icon: '💰', titulo: 'Fugas de dinero', descripcion: 'Descuadres de caja que nunca sabés de dónde vienen' },
        { icon: '😤', titulo: 'Clientes insatisfechos', descripcion: 'Demoras en la cocina y errores en los pedidos' },
      ],
    },
    solution: {
      titulo: 'BiteOps lo soluciona todo',
      subtitulo: 'Una plataforma inteligente que centraliza cada aspecto de tu restaurante.',
      items: [
        { icon: '🖥️', titulo: 'POS Inteligente', descripcion: 'Ventas rápidas, split bill, múltiples métodos de pago' },
        { icon: '📦', titulo: 'Inventario con Kardex', descripcion: 'Control FIFO/PEPS, alertas de stock bajo, mermas' },
        { icon: '👨‍🍳', titulo: 'Comandas en tiempo real', descripcion: 'Los pedidos llegan al instante a la cocina' },
        { icon: '📊', titulo: 'Dashboard financiero', descripcion: 'Ventas, costos, ganancias en gráficos claros' },
        { icon: '📱', titulo: 'Menú QR Digital', descripcion: 'Tus clientes escanean y piden desde su celular' },
        { icon: '☁️', titulo: 'Multi-sucursal', descripcion: 'Todos tus locales centralizados en un solo panel' },
      ],
    },
    differentiators: {
      titulo: '¿Por qué BiteOps?',
      subtitulo: 'Nos comparamos con la competencia para que veas la diferencia.',
      items: [
        { feature: 'POS en la nube', biteops: true, competencia: true },
        { feature: 'Comandas en cocina', biteops: true, competencia: true },
        { feature: 'Control de stock con Kardex', biteops: true, competencia: false },
        { feature: 'Menú QR Digital', biteops: true, competencia: true },
        { feature: 'Dashboard P&L', biteops: true, competencia: false },
        { feature: 'Split bill', biteops: true, competencia: false },
      ],
    },
    pricing: {
      titulo: 'Planes para tu Restaurante',
      subtitulo: 'Elegí el plan que mejor se adapte a tu negocio. Todos incluyen 14 días de prueba gratuita.',
      planes: [
        { nombre: 'Básico', precio: 39900, comision: '0,7%', descripcion: 'Ideal para pequeños comercios gastronómicos, cafeterías, foodtrucks y otros.', features: ['POS en la nube', 'Impresión de comandas', 'Menú QR Digital', 'Dashboard con reportes', 'Control de stock básico'], planId: 'basico', destacado: false },
        { nombre: 'Pro', precio: 69900, comision: '0,5%', descripcion: 'Recomendado para negocios gastronómicos medianos que buscan centralizar su operación.', features: ['Todo lo de Básico', 'Control de stock avanzado', 'Kardex FIFO/PEPS', 'Múltiples usuarios (hasta 10)', 'Corte de caja', 'Split bill', 'Branding personalizado'], planId: 'pro', destacado: true },
        { nombre: 'Enterprise', precio: 179900, comision: '0,35%', descripcion: 'Para grandes restaurantes que necesitan todas las herramientas y soporte dedicado.', features: ['Todo lo de Pro', 'Usuarios ilimitados', 'API de compras y ventas', 'Soporte prioritario', 'Multi-sucursal', 'KAM personalizado'], planId: 'enterprise', destacado: false },
      ],
    },
    testimonials: {
      titulo: 'Lo que dicen nuestros clientes',
      subtitulo: 'Restaurantes como el tuyo ya confían en BiteOps.',
      items: [
        { nombre: 'María García', cargo: 'Dueña de "La Cocina de María"', texto: 'BiteOps transformó mi restaurante. Ahora tengo control total del inventario y las ventas en tiempo real.', iniciales: 'MG' },
        { nombre: 'Carlos Martínez', cargo: 'Chef ejecutivo en "Sabores Latinos"', texto: 'Las comandas en cocina nos salvaron. Los pedidos ya no se pierden y el tiempo de preparación bajó un 30%.', iniciales: 'CM' },
        { nombre: 'Ana López', cargo: 'Gerente de "Pizzería del Sur"', texto: 'El dashboard financiero me muestra exactamente cuánto ganamos cada día. Tomar decisiones nunca fue tan fácil.', iniciales: 'AL' },
      ],
    },
    cta: {
      titulo: '¿Listo para transformar tu restaurante?',
      subtitulo: 'Probá BiteOps gratis por 14 días. Sin tarjeta de crédito.',
      boton: { texto: 'Comenzar gratis', link: '/login' },
    },
    footer: {
      marca: 'BiteOps',
      descripcion: 'El sistema operativo inteligente para restaurantes. Gestioná, optimizá y hacé crecer tu negocio.',
      grupos: [
        { titulo: 'Producto', links: [{ label: 'Demo', href: '/menu/demo' }, { label: 'Precios', href: '#precios' }, { label: 'Sobre nosotros', href: '/sobre-nosotros' }] },
        { titulo: 'Recursos', links: [{ label: 'Blog', href: 'https://biteops-blush.vercel.app/blog' }, { label: 'Contacto', href: '/contacto' }] },
        { titulo: 'Legal', links: [{ label: 'Privacidad', href: '/privacidad' }, { label: 'Términos', href: '/terminos' }] },
      ],
      copyright: '© 2026 BiteOps. Todos los derechos reservados.',
    },
  };
}
