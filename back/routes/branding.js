const { Router } = require('express');
const brandingController = require('../controllers/brandingController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = Router();

router.get('/', authenticateToken, brandingController.getBranding);
router.put('/', authenticateToken, authorizeRole('admin'), brandingController.updateBranding);

module.exports = router;
