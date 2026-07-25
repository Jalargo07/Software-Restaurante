import { Router } from 'express';
import { getPublicMenu } from '../controllers/menuController';

const router = Router();
router.get('/menus/:slug', getPublicMenu);

export default router;
