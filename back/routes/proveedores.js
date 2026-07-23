const { Router } = require('express');
const proveedorController = require('../controllers/proveedorController');
const validarProveedor = require('../middleware/validarProveedor');
const validar = require('../middleware/validar');

const router = Router();

router.get('/', proveedorController.obtenerTodos);
router.get('/:id', proveedorController.obtenerPorId);
router.post('/', validarProveedor, validar, proveedorController.crear);
router.put('/:id', validarProveedor, validar, proveedorController.actualizar);
router.delete('/:id', proveedorController.desactivar);

module.exports = router;
