import { Router } from 'express';
import { enrollmentController } from '../controllers/enrollmentController.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

router.post('/enroll', authenticate, logAudit('ENROLL', 'COURSE'), enrollmentController.enroll);
router.get('/my-enrollments', authenticate, enrollmentController.getMyEnrollments);
router.get('/check/:courseId', authenticate, enrollmentController.checkEnrollment);
router.post('/archive/:courseId', authenticate, enrollmentController.archiveCourse);
router.post('/drop/:courseId', authenticate, enrollmentController.dropCourse);

export default router;
