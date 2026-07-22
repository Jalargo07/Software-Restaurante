const { Router } = require('express');
const productoController = require('../controllers/productoController');
const validarProducto = require('../middleware/validarProducto');
const validar = require('../middleware/validar');

const router = Router();

router.get('/', productoController.obtenerTodos);
router.get('/:id', productoController.obtenerPorId);
router.post('/', validarProducto, validar, productoController.crear);
router.put('/:id', validarProducto, validar, productoController.actualizar);
router.delete('/:id', productoController.desactivar);

module.exports = router;
