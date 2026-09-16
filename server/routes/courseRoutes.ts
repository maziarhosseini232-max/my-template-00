import { Router } from 'express';
import { courseController } from '../controllers/courseController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Resource Download (via Signed URL)
router.get('/resources/download', courseController.downloadResource);

// Protected (Instructor / Admin) - MUST come before /:id
router.get('/admin/my-courses', authenticate, courseController.getAdminCourses);

// Public / Authenticated Course Details & Individual Lesson Retrieval
router.get('/', optionalAuth, courseController.getAll);
router.get('/:id', optionalAuth, courseController.getById);
router.get('/:id/lessons/:lessonId', optionalAuth, courseController.getLesson);
router.get('/:id/lessons/:lessonId/stream', optionalAuth, courseController.streamLessonVideo);
router.get('/:id/lessons/:lessonId/video', optionalAuth, courseController.streamLessonVideo);

// Protected (Instructor / Admin Course Operations)
router.post('/', authenticate, requirePermission('course:create'), logAudit('CREATE', 'COURSE'), courseController.create);
router.put('/:id', authenticate, requirePermission('course:update'), logAudit('UPDATE', 'COURSE'), courseController.update);
router.patch('/:id/status', authenticate, requirePermission('course:publish'), logAudit('UPDATE_STATUS', 'COURSE'), courseController.setStatus);
router.delete('/:id', authenticate, requirePermission('course:delete'), logAudit('DELETE', 'COURSE'), courseController.delete);

// Dedicated Section & Lesson operations
router.post('/:id/sections', authenticate, requirePermission('course:update'), logAudit('CREATE_SECTION', 'COURSE'), courseController.addSection);
router.post('/:id/sections/:sectionId/lessons', authenticate, requirePermission('lesson:create'), logAudit('CREATE_LESSON', 'COURSE'), courseController.addLesson);

export default router;
