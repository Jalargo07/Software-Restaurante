import { Producto, DetalleReceta } from '../models';
import { Transaction } from 'sequelize';

export interface StockValidation {
  productoId: number;
  nombre: string;
  stockActual: number;
  stockRequerido: number;
  valido: boolean;
}

export async function validarStock(
  productoId: number,
  cantidad: number,
  tenantId: number,
  transaction?: Transaction
): Promise<StockValidation> {
  const producto: any = await Producto.findOne({
    where: { id: productoId, tenant_id: tenantId },
    transaction
  });

  if (!producto) {
    return {
      productoId,
      nombre: '',
      stockActual: 0,
      stockRequerido: cantidad,
      valido: false
    };
  }

  if (producto.tipo === 'compuesto') {
    const ingredientes: any = await DetalleReceta.findAll({
      where: { productoId },
      transaction
    });

    let stockMinimo = Infinity;
    for (const ing of ingredientes) {
      const insumo: any = await Producto.findOne({
        where: { id: ing.insumoId, tenant_id: tenantId },
        transaction
      });
      if (!insumo) {
        stockMinimo = 0;
        break;
      }
      const disponible = Math.floor(insumo.stock / ing.cantidad);
      if (disponible < stockMinimo) {
        stockMinimo = disponible;
      }
    }

    return {
      productoId,
      nombre: producto.nombre,
      stockActual: stockMinimo === Infinity ? 0 : stockMinimo,
      stockRequerido: cantidad,
      valido: stockMinimo >= cantidad
    };
  }

  return {
    productoId,
    nombre: producto.nombre,
    stockActual: producto.stock,
    stockRequerido: cantidad,
    valido: producto.stock >= cantidad
  };
}

export async function descontarStock(
  productoId: number,
  cantidad: number,
  tenantId: number,
  transaction: Transaction
): Promise<void> {
  const producto: any = await Producto.findOne({
    where: { id: productoId, tenant_id: tenantId },
    transaction,
    lock: true
  });

  if (!producto) {
    throw new Error(`Producto ${productoId} no encontrado`);
  }

  if (producto.tipo === 'compuesto') {
    const ingredientes: any = await DetalleReceta.findAll({
      where: { productoId },
      transaction
    });

    for (const ing of ingredientes) {
      await Producto.decrement(
        { stock: ing.cantidad * cantidad },
        { where: { id: ing.insumoId, tenant_id: tenantId }, transaction }
      );
    }
  } else {
    await Producto.decrement(
      { stock: cantidad },
      { where: { id: productoId, tenant_id: tenantId }, transaction }
    );
  }
}