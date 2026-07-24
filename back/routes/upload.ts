import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import upload from '../middleware/multerUpload';
import { subirImagen, eliminarImagen } from '../controllers/uploadController';

const router = Router();

router.post('/', authenticateToken, authorizeRole('admin'), upload.single('imagen'), subirImagen);
router.delete('/:key', authenticateToken, authorizeRole('admin'), eliminarImagen);

export default router;
