const { body } = require('express-validator');

const validarProveedor = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Email inválido'),
];

module.exports = validarProveedor;
