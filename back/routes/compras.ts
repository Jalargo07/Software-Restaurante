import { Router } from 'express';
import * as compraController from '../controllers/compraController';
import validarCompra from '../middleware/validarCompra';
import validar from '../middleware/validar';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { uploadFactura } from '../middleware/multerUpload';

const router = Router();

router.get('/', authenticateToken, compraController.obtenerTodas);
router.get('/:id', authenticateToken, compraController.obtenerPorId);
router.post('/', authenticateToken, authorizeRole('admin'), validarCompra, validar, compraController.crear);
router.put('/:id/recibir', authenticateToken, authorizeRole('admin'), compraController.recibir);
router.put('/:id', authenticateToken, authorizeRole('admin'), compraController.actualizar);
router.delete('/:id', authenticateToken, authorizeRole('admin'), compraController.cancelar);
router.post('/escanear', authenticateToken, authorizeRole('admin'), uploadFactura.single('factura'), compraController.escanearFactura);
router.get('/ocr/:jobId', authenticateToken, authorizeRole('admin'), compraController.obtenerEstadoEscaneo);

export default router;
