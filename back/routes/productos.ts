import { Router } from 'express';
import * as productoController from '../controllers/productoController';
import validarProducto from '../middleware/validarProducto';
import validar from '../middleware/validar';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, productoController.obtenerTodos);
router.get('/:id', authenticateToken, productoController.obtenerPorId);
router.post('/', authenticateToken, authorizeRole('admin'), validarProducto, validar, productoController.crear);
router.put('/:id', authenticateToken, authorizeRole('admin'), validarProducto, validar, productoController.actualizar);
router.delete('/:id', authenticateToken, authorizeRole('admin'), productoController.desactivar);

export default router;
