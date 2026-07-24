import { body } from 'express-validator';

export const validarProducto = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('precioCompra').isFloat({ min: 0 }).withMessage('El precio de compra debe ser un número positivo'),
  body('precioVenta').isFloat({ min: 0 }).withMessage('El precio de venta debe ser un número positivo'),
  body('categoria').isIn(['bebida', 'comida', 'insumo', 'postre']).withMessage('Categoría inválida'),
];

export default validarProducto;
