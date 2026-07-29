import { body } from 'express-validator';

export const validarCompra = [
  body('proveedorId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El proveedor debe ser un número válido'),
  body('detalles').isArray({ min: 1 }).withMessage('Debe haber al menos un producto en la compra'),
  body('detalles.*.productoId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('El ID del producto debe ser un número válido'),
  body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('detalles.*.precioUnitario').isFloat({ min: 0 }).withMessage('El precio unitario debe ser un número positivo'),
];

export default validarCompra;
