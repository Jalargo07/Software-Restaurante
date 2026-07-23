const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { obtenerLogs } = require('../controllers/auditoriaController');

router.get('/', authenticateToken, authorizeRole('admin'), obtenerLogs);

module.exports = router;
