import { Request, Response, NextFunction } from 'express';
import { OnboardingProgress, Mesa, Producto, Usuario } from '../models';

export async function obtenerOnboarding(req: Request, res: Response, next: NextFunction) {
  try {
    const progress = await OnboardingProgress.findOne({
      where: { tenantId: req.tenantId }
    });
    
    if (!progress) {
      return res.json({ ok: true, stepCompleted: 0, totalSteps: 3 });
    }
    
    res.json({ 
      ok: true, 
      stepCompleted: (progress as any).stepCompleted, 
      totalSteps: 3,
      metadata: (progress as any).metadata 
    });
  } catch (error) {
    next(error);
  }
}

export async function completarStep1(req: Request, res: Response, next: NextFunction) {
  try {
    const { mesas } = req.body;
    
    for (const m of mesas) {
      await Mesa.create({
        tenant_id: req.tenantId!,
        numero: m.numero,
        capacidad: m.capacidad,
        estado: 'disponible'
      });
    }
    
    await OnboardingProgress.upsert({
      tenantId: req.tenantId!,
      stepCompleted: 1,
      metadata: { mesasCreadas: mesas.length }
    });
    
    res.json({ ok: true, stepCompleted: 1 });
  } catch (error) {
    next(error);
  }
}

export async function completarStep2(req: Request, res: Response, next: NextFunction) {
  try {
    const { productos } = req.body;
    
    for (const p of productos) {
      await Producto.create({
        tenant_id: req.tenantId!,
        nombre: p.nombre,
        descripcion: p.descripcion || '',
        categoria: p.categoria || 'Sin categoría',
        tipo: p.tipo || 'directo',
        precioVenta: p.precioVenta || 0,
        precioCompra: p.precioCompra || 0,
        stock: p.stock || 0,
        stockMinimo: p.stockMinimo || 0,
        unidad: p.unidad || 'unidad',
        activo: true
      });
    }
    
    await OnboardingProgress.update(
      { stepCompleted: 2, metadata: { productosCargados: productos.length } },
      { where: { tenantId: req.tenantId } }
    );
    
    res.json({ ok: true, stepCompleted: 2 });
  } catch (error) {
    next(error);
  }
}

export async function completarStep3(req: Request, res: Response, next: NextFunction) {
  try {
    const { usuarios } = req.body;
    
    for (const u of usuarios) {
      await Usuario.create({
        tenant_id: req.tenantId!,
        nombre: u.nombre,
        email: u.email,
        password: u.password,
        rol: u.rol || 'mesero',
        activo: true
      });
    }
    
    await OnboardingProgress.update(
      { stepCompleted: 3, metadata: { usuariosCreados: usuarios.length } },
      { where: { tenantId: req.tenantId } }
    );
    
    res.json({ ok: true, stepCompleted: 3, onboardingCompletado: true });
  } catch (error) {
    next(error);
  }
}