import { Router } from 'express';
import * as proveedorController from '../controllers/proveedorController';
import validarProveedor from '../middleware/validarProveedor';
import validar from '../middleware/validar';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, proveedorController.obtenerTodos);
router.get('/:id/historial', authenticateToken, proveedorController.historialCompras);
router.get('/:id', authenticateToken, proveedorController.obtenerPorId);
router.post('/', authenticateToken, authorizeRole('admin'), validarProveedor, validar, proveedorController.crear);
router.put('/:id', authenticateToken, authorizeRole('admin'), validarProveedor, validar, proveedorController.actualizar);
router.delete('/:id', authenticateToken, authorizeRole('admin'), proveedorController.desactivar);

export default router;
