import { body } from 'express-validator';

export const validarProveedor = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').optional({ nullable: true }).isEmail().withMessage('Email inválido'),
];

export default validarProveedor;
