const { Router } = require('express');
const { getPublicBranding } = require('../controllers/brandingController');
const router = Router();
router.get('/:slug', getPublicBranding);
module.exports = router;
