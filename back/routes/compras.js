const { Router } = require('express');
const compraController = require('../controllers/compraController');
const validarCompra = require('../middleware/validarCompra');
const validar = require('../middleware/validar');

const router = Router();

router.get('/', compraController.obtenerTodas);
router.get('/:id', compraController.obtenerPorId);
router.post('/', validarCompra, validar, compraController.crear);
router.delete('/:id', compraController.cancelar);

module.exports = router;
