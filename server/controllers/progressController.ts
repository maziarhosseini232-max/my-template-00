import { Response, NextFunction } from 'express';
import { progressService } from '../services/progressService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class ProgressController {
  async updateLessonProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const { courseId, lessonId, isCompleted, positionSeconds } = req.body;
      if (!courseId || !lessonId) {
        res.status(400).json({ success: false, message: 'شناسه دوره و درس الزامی است.' });
        return;
      }

      const result = await progressService.updateLessonProgress(
        req.user.userId,
        courseId,
        lessonId,
        isCompleted ?? true,
        positionSeconds || 0
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      next(error);
    }
  }

  async getCourseProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const progress = await progressService.getCourseProgress(req.user.userId, req.params.courseId);
      res.json({ success: true, data: progress });
    } catch (error: any) {
      next(error);
    }
  }

  async saveNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const { courseId, lessonId, text, timestampSeconds } = req.body;
      const note = await progressService.saveNote(req.user.userId, courseId, lessonId, text, timestampSeconds || 0);
      res.status(201).json({ success: true, message: 'یادداشت ذخیره شد.', data: note });
    } catch (error: any) {
      next(error);
    }
  }

  async getNotes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const notes = await progressService.getNotes(req.user.userId, req.query.courseId as string);
      res.json({ success: true, count: notes.length, data: notes });
    } catch (error: any) {
      next(error);
    }
  }

  async deleteNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return;
      const result = await progressService.deleteNote(req.user.userId, req.params.noteId);
      res.json({ success: true, message: result.message });
    } catch (error: any) {
      next(error);
    }
  }
}

export const progressController = new ProgressController();
