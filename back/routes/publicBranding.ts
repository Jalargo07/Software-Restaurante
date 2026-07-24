import { Router } from 'express';
import { getPublicBranding } from '../controllers/brandingController';

const router = Router();

router.get('/:slug', getPublicBranding);

export default router;
