const { Router } = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const upload = require('../middleware/multerUpload');
const { subirImagen, eliminarImagen } = require('../controllers/uploadController');

const router = Router();

router.post('/', authenticateToken, authorizeRole('admin'), upload.single('imagen'), subirImagen);
router.delete('/:key', authenticateToken, authorizeRole('admin'), eliminarImagen);

module.exports = router;
