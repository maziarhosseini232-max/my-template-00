import { db } from '../db/index.js';
import { LessonProgress, CourseProgress, LessonNote } from '../db/schema.js';

export class ProgressService {
  private resolveCourse(courseIdOrSlug: string) {
    return db.courses.find(c => (c.id === courseIdOrSlug || c.slug === courseIdOrSlug) && !c.deletedAt);
  }

  async updateLessonProgress(userId: string, courseIdOrSlug: string, lessonId: string, isCompleted: boolean, positionSeconds = 0) {
    const now = new Date().toISOString();
    const course = this.resolveCourse(courseIdOrSlug);
    const resolvedCourseId = course ? course.id : courseIdOrSlug;

    let lp = db.lessonProgress.find(p => p.userId === userId && p.courseId === resolvedCourseId && p.lessonId === lessonId);
    if (!lp) {
      lp = {
        id: 'lp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId,
        courseId: resolvedCourseId,
        lessonId,
        isCompleted,
        lastPositionSeconds: positionSeconds,
        timeSpentSeconds: positionSeconds,
        completedAt: isCompleted ? now : null,
        updatedAt: now
      };
      db.lessonProgress.push(lp);
    } else {
      if (isCompleted) {
        lp.isCompleted = true;
        if (!lp.completedAt) {
          lp.completedAt = now;
        }
      } else if (positionSeconds > 0 && lp.isCompleted) {
        // Retain completion status during playback seeking / auto-saving
        lp.isCompleted = true;
      } else {
        lp.isCompleted = isCompleted;
      }
      lp.lastPositionSeconds = positionSeconds;
      lp.updatedAt = now;
    }

    // Synchronize Enrollment last watched state
    const enrollment = db.enrollments.find(e => e.userId === userId && e.courseId === resolvedCourseId);
    if (enrollment) {
      enrollment.lastLessonId = lessonId;
      if (positionSeconds > 0) {
        enrollment.lastPositionSeconds = positionSeconds;
      }
      if (!Array.isArray(enrollment.completedLessonIds)) {
        enrollment.completedLessonIds = [];
      }
      if (isCompleted && !enrollment.completedLessonIds.includes(lessonId)) {
        enrollment.completedLessonIds.push(lessonId);
      } else if (!isCompleted && positionSeconds === 0 && !lp.isCompleted) {
        enrollment.completedLessonIds = enrollment.completedLessonIds.filter(id => id !== lessonId);
      }
      enrollment.updatedAt = now;
    }

    // Recalculate Course Progress
    if (course) {
      let totalLessons = 0;
      if (course.sections && Array.isArray(course.sections)) {
        course.sections.forEach(s => {
          totalLessons += (s.lessons || []).length;
        });
      }

      const completedCount = db.lessonProgress.filter(
        p => p.userId === userId && p.courseId === resolvedCourseId && p.isCompleted
      ).length;

      let cp = db.courseProgress.find(p => p.userId === userId && p.courseId === resolvedCourseId);
      const percent = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
      const isFinished = percent === 100;

      if (!cp) {
        cp = {
          id: 'cp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          userId,
          courseId: resolvedCourseId,
          progressPercent: percent,
          completedLessonsCount: completedCount,
          totalLessonsCount: totalLessons,
          lastWatchedLessonId: lessonId,
          isCompleted: isFinished,
          completedAt: isFinished ? now : null,
          certificateIssued: isFinished,
          updatedAt: now
        };
        db.courseProgress.push(cp);
      } else {
        cp.progressPercent = percent;
        cp.completedLessonsCount = completedCount;
        cp.totalLessonsCount = totalLessons;
        cp.lastWatchedLessonId = lessonId;
        cp.isCompleted = isFinished;
        if (isFinished && !cp.completedAt) {
          cp.completedAt = now;
          cp.certificateIssued = true;
        }
        cp.updatedAt = now;
      }

      return { lessonProgress: lp, courseProgress: cp, completedLessonIds: db.lessonProgress.filter(p => p.userId === userId && p.courseId === resolvedCourseId && p.isCompleted).map(p => p.lessonId) };
    }

    return { lessonProgress: lp, courseProgress: null, completedLessonIds: [] };
  }

  async getCourseProgress(userId: string, courseIdOrSlug: string) {
    const course = this.resolveCourse(courseIdOrSlug);
    const resolvedCourseId = course ? course.id : courseIdOrSlug;

    const cp = db.courseProgress.find(p => p.userId === userId && p.courseId === resolvedCourseId);
    const lps = db.lessonProgress.filter(p => p.userId === userId && p.courseId === resolvedCourseId);
    return {
      courseProgress: cp || {
        progressPercent: 0,
        completedLessonsCount: 0,
        totalLessonsCount: 0,
        isCompleted: false
      },
      completedLessonIds: lps.filter(l => l.isCompleted).map(l => l.lessonId),
      lessonProgressList: lps
    };
  }

  async saveNote(userId: string, courseIdOrSlug: string, lessonId: string, text: string, timestampSeconds: number) {
    const course = this.resolveCourse(courseIdOrSlug);
    const resolvedCourseId = course ? course.id : courseIdOrSlug;
    const now = new Date().toISOString();
    const newNote: LessonNote = {
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      courseId: resolvedCourseId,
      lessonId,
      timestampSeconds,
      text,
      createdAt: now,
      updatedAt: now
    };
    db.lessonNotes.push(newNote);
    return newNote;
  }

  async getNotes(userId: string, courseIdOrSlug?: string) {
    if (courseIdOrSlug) {
      const course = this.resolveCourse(courseIdOrSlug);
      const resolvedCourseId = course ? course.id : courseIdOrSlug;
      return db.lessonNotes.filter(n => n.userId === userId && (n.courseId === resolvedCourseId || n.courseId === courseIdOrSlug));
    }
    return db.lessonNotes.filter(n => n.userId === userId);
  }

  async deleteNote(userId: string, noteId: string) {
    const idx = db.lessonNotes.findIndex(n => n.id === noteId && n.userId === userId);
    if (idx === -1) throw new Error('یادداشت یافت نشد.');
    db.lessonNotes.splice(idx, 1);
    return { success: true, message: 'یادداشت با موفقیت حذف شد.' };
  }
}

export const progressService = new ProgressService();
