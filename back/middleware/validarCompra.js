const { body } = require('express-validator');

const validarCompra = [
  body('proveedorId').isInt({ min: 1 }).withMessage('El proveedor es obligatorio'),
  body('detalles').isArray({ min: 1 }).withMessage('Debe haber al menos un producto en la compra'),
  body('detalles.*.productoId').isInt({ min: 1 }).withMessage('El ID del producto es obligatorio'),
  body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('detalles.*.precioUnitario').isFloat({ min: 0 }).withMessage('El precio unitario debe ser un número positivo'),
];

module.exports = validarCompra;
