import { Router } from 'express';
import { seoController } from '../controllers/seoController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

router.get('/entity/:type/:id', seoController.getEntitySeo);
router.post('/entity', authenticate, requirePermission('seo:update'), logAudit('UPDATE_SEO', 'SEO'), seoController.updateEntitySeo);

export default router;
