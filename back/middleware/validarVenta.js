const { body } = require('express-validator');

const validarVenta = [
  body('mesaId').isInt({ min: 1 }).withMessage('El ID de la mesa es obligatorio'),
  body('detalles').isArray({ min: 1 }).withMessage('Debe haber al menos un producto en la venta'),
  body('detalles.*.productoId').isInt({ min: 1 }).withMessage('El ID del producto es obligatorio'),
  body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
  body('detalles.*.precioUnitario').isFloat({ min: 0 }).withMessage('El precio unitario debe ser un número positivo'),
  body('metodoPago').optional().isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Método de pago inválido'),
  body('cliente').optional().isString().withMessage('El cliente debe ser una cadena de texto'),
];

module.exports = validarVenta;
