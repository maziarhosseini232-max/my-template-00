import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Protect all admin endpoints for OWNER or ADMIN
router.use(authenticate, requireRole(['OWNER', 'ADMIN']));

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/roles', logAudit('CHANGE_USER_ROLE', 'USER'), adminController.updateUserRole);
router.get('/audit-logs', adminController.getAuditLogs);
router.post('/wipe-test-data', logAudit('WIPE_TEST_DATA', 'DATABASE'), adminController.wipeTestData);

export default router;
