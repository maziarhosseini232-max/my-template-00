import { Router } from 'express';
import { cmsController } from '../controllers/cmsController.js';
import { authenticate } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Homepage Sections (Site Builder)
router.get('/homepage-sections', cmsController.getHomepageSections);
router.put('/homepage-sections/:id', authenticate, requirePermission('cms:manage'), logAudit('UPDATE_SECTION', 'HOMEPAGE_SECTION'), cmsController.updateHomepageSection);
router.post('/homepage-sections/reorder', authenticate, requirePermission('cms:manage'), logAudit('REORDER_SECTIONS', 'HOMEPAGE_SECTION'), cmsController.reorderHomepageSections);
router.post('/homepage-sections', authenticate, requirePermission('cms:manage'), logAudit('CREATE_SECTION', 'HOMEPAGE_SECTION'), cmsController.addHomepageSection);
router.delete('/homepage-sections/:id', authenticate, requirePermission('cms:manage'), logAudit('DELETE_SECTION', 'HOMEPAGE_SECTION'), cmsController.deleteHomepageSection);

// Site Settings
router.get('/settings', cmsController.getSettings);
router.put('/settings', authenticate, requirePermission('settings:update'), logAudit('UPDATE_SETTINGS', 'SETTINGS'), cmsController.updateSettings);

// Navigation CMS
router.get('/navigation', cmsController.getNavigation);
router.post('/navigation', authenticate, requirePermission('navigation:update'), logAudit('CREATE_NAV_ITEM', 'NAVIGATION'), cmsController.addNavigationItem);
router.put('/navigation/:id', authenticate, requirePermission('navigation:update'), logAudit('UPDATE_NAV_ITEM', 'NAVIGATION'), cmsController.updateNavigationItem);
router.delete('/navigation/:id', authenticate, requirePermission('navigation:update'), logAudit('DELETE_NAV_ITEM', 'NAVIGATION'), cmsController.deleteNavigationItem);

export default router;
