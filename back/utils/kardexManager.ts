import { Kardex, Producto } from '../models';
import { Transaction } from 'sequelize';
import { withTenant } from './tenantScope';

export async function registrarKardexSalida(
  productoId: number,
  cantidad: number,
  precioUnitario: number,
  ventaId: number,
  tenantId: number,
  transaction: Transaction
): Promise<void> {
  await Kardex.create(withTenant({
    productoId,
    tipo: 'salida',
    cantidad,
    precioUnitario,
    ventaId,
    fecha: new Date()
  }, tenantId), { transaction });
}

export async function registrarKardexEntrada(
  productoId: number,
  cantidad: number,
  precioUnitario: number,
  compraId: number,
  tenantId: number,
  transaction: Transaction
): Promise<void> {
  await Kardex.create(withTenant({
    productoId,
    tipo: 'entrada',
    cantidad,
    precioUnitario,
    compraId,
    fecha: new Date()
  }, tenantId), { transaction });
}

export async function obtenerCostoUnitario(
  productoId: number,
  tenantId: number,
  transaction: Transaction
): Promise<number> {
  const entradas: any = await Kardex.findAll({
    where: {
      tenantId,
      productoId,
      tipo: 'entrada',
    },
    order: [['fecha', 'ASC']],
    transaction,
  });

  if (entradas.length === 0) {
    const producto: any = await Producto.findOne({
      where: { id: productoId, tenantId },
      transaction
    });
    return producto ? Number(producto.precioCompra) : 0;
  }

  return Number(entradas[0].precioUnitario);
}