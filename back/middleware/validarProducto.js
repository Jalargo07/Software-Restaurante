const { body } = require('express-validator');

const validarProducto = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('precioCompra').isFloat({ min: 0 }).withMessage('El precio de compra debe ser un número positivo'),
  body('precioVenta').isFloat({ min: 0 }).withMessage('El precio de venta debe ser un número positivo'),
  body('categoria').isIn(['bebida', 'comida', 'insumo', 'postre']).withMessage('Categoría inválida'),
  body('codigoBarras')
    .custom((value, { req }) => {
      if (req.body.categoria === 'insumo') {
        if (value && typeof value !== 'string') {
          throw new Error('El código de barras debe ser una cadena de texto');
        }
      }
      return true;
    }),
];

module.exports = validarProducto;
