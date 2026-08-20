export function serializeProducto(producto: any) {
  const data = producto.toJSON ? producto.toJSON() : producto;
  const { password, ...rest } = data;
  return rest;
}
