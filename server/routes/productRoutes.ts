import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/:id/request-download', optionalAuth, productController.requestDownload);
router.get('/download/file', productController.downloadFile);

export default router;
