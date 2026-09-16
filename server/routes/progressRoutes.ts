import { Router } from 'express';
import { progressController } from '../controllers/progressController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/lesson', authenticate, progressController.updateLessonProgress);
router.get('/course/:courseId', authenticate, progressController.getCourseProgress);
router.post('/notes', authenticate, progressController.saveNote);
router.get('/notes', authenticate, progressController.getNotes);
router.delete('/notes/:noteId', authenticate, progressController.deleteNote);

export default router;
