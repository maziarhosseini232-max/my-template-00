import { Response, NextFunction } from 'express';
import { enrollmentService } from '../services/enrollmentService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class EnrollmentController {
  async enroll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({ success: false, message: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' });
        return;
      }
      const { courseId } = req.body;
      if (!courseId) {
        res.status(400).json({ success: false, message: 'شناسه دوره الزامی است.' });
        return;
      }

      const result = await enrollmentService.enroll(req.user.userId, courseId, 'FREE');
      res.status(result.isNew ? 201 : 200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (error: any) {
      if (error.message?.includes('یافت نشد')) {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (error.message?.includes('انتشار') || error.message?.includes('غیرفعال')) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      next(error);
    }
  }

  async checkEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است.' });
        return;
      }
      const isEnrolled = await enrollmentService.isEnrolled(req.user.userId, req.params.courseId);
      res.json({ success: true, isEnrolled });
    } catch (error: any) {
      next(error);
    }
  }

  async getMyEnrollments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است.' });
        return;
      }
      const enrollments = await enrollmentService.getUserEnrollments(req.user.userId);
      res.json({ success: true, count: enrollments.length, data: enrollments });
    } catch (error: any) {
      next(error);
    }
  }

  async archiveCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است.' });
        return;
      }
      const { courseId } = req.params;
      const result = await enrollmentService.archiveCourse(req.user.userId, courseId);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({ success: false, message: error.message });
    }
  }

  async dropCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است.' });
        return;
      }
      const { courseId } = req.params;
      const result = await enrollmentService.dropCourse(req.user.userId, courseId);
      res.json(result);
    } catch (error: any) {
      res.status(error.status || 400).json({ success: false, message: error.message });
    }
  }
}

export const enrollmentController = new EnrollmentController();

