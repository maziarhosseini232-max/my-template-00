import { db } from '../db/index.js';
import { Enrollment, CourseProgress } from '../db/schema.js';

export class EnrollmentService {
  async enroll(userId: string, courseIdOrSlug: string, accessType: 'FREE' | 'PAID' = 'FREE') {
    // 1. Verify User
    const user = db.users.find(u => u.id === userId && !u.deletedAt && u.isActive);
    if (!user) {
      throw new Error('کاربر نامعتبر یا غیرفعال است.');
    }

    // 2. Verify Course
    const course = db.courses.find(c => (c.id === courseIdOrSlug || c.slug === courseIdOrSlug) && !c.deletedAt);
    if (!course) {
      throw new Error('دوره مورد نظر یافت نشد.');
    }

    // 3. Verify Course Status
    if (course.status !== 'PUBLISHED') {
      throw new Error('دوره در وضعیت انتشار قرار ندارد و امکان ثبت‌نام در آن نیست.');
    }

    // 4. Duplicate Check
    const existing = db.enrollments.find(e => e.userId === user.id && e.courseId === course.id && e.isActive);
    if (existing) {
      return { 
        enrollment: existing, 
        isNew: false, 
        courseId: course.id,
        message: 'شما قبلاً در این دوره ثبت‌نام کرده‌اید.' 
      };
    }

    // 5. Verify VIP vs Paid vs Free Access
    let resolvedAccessType: 'FREE' | 'PAID' = accessType;
    const isVipCourse = Boolean(course.isVip || course.requiresSubscription);
    const isAdmin = user.roles.includes('ADMIN') || user.roles.includes('OWNER');

    if (isVipCourse && !isAdmin) {
      const hasActiveVip = !!(
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate).getTime() > Date.now()
      );

      if (!hasActiveVip) {
        const err: any = new Error('این دوره نیازمند اشتراک ویژه (VIP) فعال است. لطفاً ابتدا اشتراک خود را تهیه یا تمدید فرمایید.');
        err.status = 403;
        err.code = 'FORBIDDEN_SUBSCRIPTION_REQUIRED';
        throw err;
      }
      resolvedAccessType = 'PAID';
    } else if (!course.isFree && (course.price || 0) > 0) {
      if (!isAdmin && accessType !== 'PAID') {
        // Check if user has an approved/paid order for this course
        const hasPaidOrder = db.orders.some(o => 
          o.userId === user.id && 
          o.status === 'PAID' && 
          o.items.some(i => i.courseId === course.id)
        );

        if (hasPaidOrder) {
          resolvedAccessType = 'PAID';
        } else {
          throw new Error('این دوره پولی است و جهت دسترسی نیاز به پرداخت و ثبت سفارش دارد.');
        }
      } else {
        resolvedAccessType = 'PAID';
      }
    } else {
      resolvedAccessType = 'FREE';
    }

    const now = new Date().toISOString();
    const newEnrollment: Enrollment = {
      id: 'enr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: user.id,
      courseId: course.id,
      accessType: resolvedAccessType,
      enrolledAt: now,
      isActive: true
    };

    db.enrollments.push(newEnrollment);

    // Calculate total lessons
    let totalLessons = 0;
    if (course.sections && Array.isArray(course.sections)) {
      course.sections.forEach(s => {
        totalLessons += (s.lessons || []).length;
      });
    }

    // Initialize course progress
    let progress = db.courseProgress.find(cp => cp.userId === user.id && cp.courseId === course.id);
    if (!progress) {
      progress = {
        id: 'cp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId: user.id,
        courseId: course.id,
        progressPercent: 0,
        completedLessonsCount: 0,
        totalLessonsCount: totalLessons || 1,
        isCompleted: false,
        certificateIssued: false,
        updatedAt: now
      };
      db.courseProgress.push(progress);
    }

    course.enrolledStudentsCount = (course.enrolledStudentsCount || 0) + 1;

    return {
      enrollment: newEnrollment,
      isNew: true,
      courseId: course.id,
      progress,
      message: 'ثبت‌نام در دوره با موفقیت انجام شد.'
    };
  }

  async isEnrolled(userId: string, courseIdOrSlug: string): Promise<boolean> {
    const course = db.courses.find(c => c.id === courseIdOrSlug || c.slug === courseIdOrSlug);
    const resolvedCourseId = course ? course.id : courseIdOrSlug;
    return db.enrollments.some(e => e.userId === userId && e.courseId === resolvedCourseId && e.isActive);
  }

  async getUserEnrollments(userId: string) {
    const userEnrollments = db.enrollments.filter(e => e.userId === userId && e.isActive);
    const result = userEnrollments.map(enr => {
      const course = db.courses.find(c => c.id === enr.courseId);
      const progress = db.courseProgress.find(cp => cp.userId === userId && cp.courseId === enr.courseId);
      return {
        ...enr,
        course,
        progress: progress || { progressPercent: 0, completedLessonsCount: 0, totalLessonsCount: 0 }
      };
    });
    return result;
  }

  async archiveCourse(userId: string, courseId: string) {
    const enrollment = db.enrollments.find(e => e.userId === userId && e.courseId === courseId && e.isActive);
    if (!enrollment) {
      throw new Error('دوره در لیست دوره‌های فعال شما یافت نشد.');
    }

    const progress = db.courseProgress.find(cp => cp.userId === userId && cp.courseId === courseId);
    const isCompleted = progress ? (progress.isCompleted || progress.progressPercent >= 100) : false;
    
    // Toggle archive state
    enrollment.isArchived = !enrollment.isArchived;
    enrollment.updatedAt = new Date().toISOString();
    db.saveSnapshotSync();

    return {
      success: true,
      isArchived: enrollment.isArchived,
      message: enrollment.isArchived ? 'دوره با موفقیت به بخش بایگانی منتقل شد.' : 'دوره با موفقیت از حالت بایگانی خارج شد.'
    };
  }

  async dropCourse(userId: string, courseId: string) {
    const enrollment = db.enrollments.find(e => e.userId === userId && e.courseId === courseId && e.isActive);
    if (!enrollment) {
      throw new Error('دوره در لیست دوره‌های فعال شما یافت نشد.');
    }

    const course = db.courses.find(c => c.id === courseId);
    const isCourseFree = course ? (course.isFree || (course.price || 0) === 0) : false;

    if (!isCourseFree && enrollment.accessType !== 'FREE') {
      const err: any = new Error('انصراف مستقیم از دوره فقط برای دوره‌های رایگان مجاز است. برای دوره‌های غیررایگان لطفاً به پشتیبانی پیام دهید.');
      err.status = 400;
      throw err;
    }

    enrollment.isActive = false;
    enrollment.updatedAt = new Date().toISOString();

    const user = db.users.find(u => u.id === userId);
    if (user && user.enrolledCourseIds) {
      user.enrolledCourseIds = user.enrolledCourseIds.filter(id => id !== courseId);
    }

    if (course && course.enrolledStudentsCount && course.enrolledStudentsCount > 0) {
      course.enrolledStudentsCount--;
    }

    db.saveSnapshotSync();

    return {
      success: true,
      message: 'انصراف از دوره با موفقیت ثبت گردید و دوره از لیست شما حذف شد.'
    };
  }
}

export const enrollmentService = new EnrollmentService();

