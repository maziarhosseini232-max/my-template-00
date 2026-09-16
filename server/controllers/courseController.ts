import { Request, Response, NextFunction } from 'express';
import { courseService } from '../services/courseService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class CourseController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { categoryId, search, level, instructorId } = req.query;
      const courses = await courseService.getAllPublished({
        categoryId: categoryId as string,
        search: search as string,
        level: level as any,
        instructorId: instructorId as string
      }, req.user);
      res.json({ success: true, count: courses.length, data: courses });
    } catch (error: any) {
      next(error);
    }
  }

  async getAdminCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const isSuperAdmin = req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN');
      const courses = await courseService.getAllForAdminOrInstructor(req.user.userId, isSuperAdmin);
      res.json({ success: true, count: courses.length, data: courses });
    } catch (error: any) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const course = await courseService.getById(req.params.id, req.user);
      res.json({ success: true, data: course });
    } catch (error: any) {
      next(error);
    }
  }

  async getLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: courseId, lessonId } = req.params;
      const result = await courseService.getLessonById(courseId, lessonId, req.user);
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.status === 403) {
        res.status(403).json({
          success: false,
          code: error.code || 'FORBIDDEN_SUBSCRIPTION_REQUIRED',
          message: error.message || 'دسترسی به این جلسه نیازمند اشتراک ویژه (VIP) فعال است.'
        });
        return;
      }
      next(error);
    }
  }

  async streamLessonVideo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id: courseId, lessonId } = req.params;
      const result = await courseService.getLessonStream(courseId, lessonId, req.user);
      
      // If client requests redirect or JSON info
      if (req.query.format === 'json') {
        res.json({ success: true, data: result });
        return;
      }
      
      if (result.videoUrl) {
        res.redirect(result.videoUrl);
      } else {
        res.status(404).json({ success: false, message: 'آدرس ویدئو یافت نشد.' });
      }
    } catch (error: any) {
      if (error.status === 403) {
        res.status(403).json({
          success: false,
          code: error.code || 'FORBIDDEN_SUBSCRIPTION_REQUIRED',
          message: error.message || 'پخش این ویدئو نیازمند اشتراک ویژه (VIP) فعال است.'
        });
        return;
      }
      next(error);
    }
  }

  async downloadResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, u, exp, sig } = req.query as { key: string; u: string; exp: string; sig: string };
      if (!key || !u || !exp || !sig) {
        res.status(400).json({ success: false, message: 'پارامترهای لینک دانلود نامعتبر است.' });
        return;
      }

      const isValid = courseService.verifySignedUrl(key, u, parseInt(exp, 10), sig);
      if (!isValid) {
        res.status(403).json({ success: false, message: 'لینک دانلود نامعتبر یا منقضی شده است.' });
        return;
      }

      // Mock safe content payload stream/redirect
      res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop() || 'resource'}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(`Lumina Learn Secure Resource Content for [${key}] - Verified User [${u}]`);
    } catch (error: any) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const isSuperAdmin = req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN');
      const newCourse = await courseService.create(req.user.userId, isSuperAdmin, req.body);
      res.status(201).json({
        success: true,
        message: 'دوره با موفقیت ایجاد شد.',
        data: newCourse
      });
    } catch (error: any) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const isSuperAdmin = req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN');
      const updated = await courseService.update(req.params.id, req.user.userId, isSuperAdmin, req.body);
      res.json({
        success: true,
        message: 'دوره با موفقیت به‌روزرسانی شد.',
        data: updated
      });
    } catch (error: any) {
      next(error);
    }
  }

  async setStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const { status } = req.body;
      const isSuperAdmin = req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN');
      const updated = await courseService.updateStatus(req.params.id, req.user.userId, isSuperAdmin, status);
      res.json({
        success: true,
        message: `وضعیت دوره به ${status} تغییر یافت.`,
        data: updated
      });
    } catch (error: any) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const isSuperAdmin = req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN');
      const result = await courseService.delete(req.params.id, req.user.userId, isSuperAdmin);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      next(error);
    }
  }

  async addSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const isSuperAdmin = req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN');
      const result = await courseService.addSection(req.params.id, req.user.userId, isSuperAdmin, req.body.title);
      res.status(201).json({
        success: true,
        message: 'سرفصل جدید اضافه شد.',
        data: result
      });
    } catch (error: any) {
      next(error);
    }
  }

  async addLesson(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const isSuperAdmin = req.user.roles.includes('OWNER') || req.user.roles.includes('ADMIN');
      const result = await courseService.addLesson(req.params.id, req.params.sectionId, req.user.userId, isSuperAdmin, req.body);
      res.status(201).json({
        success: true,
        message: 'جلسه جدید اضافه شد.',
        data: result
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const courseController = new CourseController();
