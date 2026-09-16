import { db } from '../db/index.js';
import { Course, CourseStatus, CourseLevel, CourseLesson, CourseSection, LessonResource } from '../db/schema.js';
import { generateSlug } from '../utils/slugify.js';
import { enrollmentService } from './enrollmentService.js';
import { config } from '../config/index.js';
import crypto from 'crypto';

const SIGNING_SECRET = config.jwtSecret;

export interface AccessEvaluation {
  canAccessFull: boolean;
  reason: 'OWNER' | 'ADMIN' | 'INSTRUCTOR' | 'SUBSCRIBED' | 'FREE' | 'ENROLLED' | 'UNAUTHORIZED';
}

export class CourseService {
  /**
   * Helper to generate a temporary secure signed URL for private resources
   */
  generateSignedUrl(storageKey: string, userId: string, expiresInMinutes = 60): string {
    const expires = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60);
    const signature = crypto
      .createHmac('sha256', SIGNING_SECRET)
      .update(`${storageKey}:${userId}:${expires}`)
      .digest('hex');
    return `/api/courses/resources/download?key=${encodeURIComponent(storageKey)}&u=${encodeURIComponent(userId)}&exp=${expires}&sig=${signature}`;
  }

  /**
   * Verify temporary signed resource URL signature
   */
  verifySignedUrl(storageKey: string, userId: string, exp: number, sig: string): boolean {
    if (!storageKey || !userId || !exp || !sig) return false;
    if (Date.now() / 1000 > exp) return false;
    try {
      const expected = crypto
        .createHmac('sha256', SIGNING_SECRET)
        .update(`${storageKey}:${userId}:${exp}`)
        .digest('hex');
      
      const sigBuf = Buffer.from(sig);
      const expBuf = Buffer.from(expected);
      if (sigBuf.length !== expBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  /**
   * Evaluates if user has full access (Admin, Owner, Course Instructor, or Active Enrolled Student)
   */
  async evaluateUserCourseAccess(
    course: Course,
    user?: { userId: string; roles: string[] }
  ): Promise<AccessEvaluation> {
    if (!user) {
      return { canAccessFull: false, reason: 'UNAUTHORIZED' };
    }

    // 1. Owner & Admin have universal master access
    if (user.roles.includes('OWNER') || user.roles.includes('ADMIN')) {
      return { canAccessFull: true, reason: 'ADMIN' };
    }

    // 2. Instructor of this specific course has access
    if (course.instructorId === user.userId) {
      return { canAccessFull: true, reason: 'INSTRUCTOR' };
    }

    // 3. Free Course Access (only if isFree is true and neither isVip nor requiresSubscription)
    const isVipCourse = Boolean(course.isVip || course.requiresSubscription);
    if (course.isFree && !isVipCourse) {
      return { canAccessFull: true, reason: 'FREE' };
    }

    // 4. VIP Subscription Check (verifies user.subscriptionEndDate > Date.now())
    const dbUser = db.users.find(u => u.id === user.userId && !u.deletedAt);
    if (dbUser && dbUser.subscriptionEndDate) {
      const expiry = new Date(dbUser.subscriptionEndDate).getTime();
      if (expiry > Date.now()) {
        return { canAccessFull: true, reason: 'SUBSCRIBED' };
      }
    }

    // 5. If course is VIP (isVip == true), access is strictly restricted to active VIP subscribers
    if (isVipCourse) {
      return { canAccessFull: false, reason: 'UNAUTHORIZED' };
    }

    // 6. Direct Course Enrollment (for non-VIP courses)
    const isEnrolled = await enrollmentService.isEnrolled(user.userId, course.id);
    if (isEnrolled) {
      return { canAccessFull: true, reason: 'ENROLLED' };
    }

    return { canAccessFull: false, reason: 'UNAUTHORIZED' };
  }

  /**
   * Sanitizes lesson content based on user authorization
   */
  sanitizeLesson(lesson: CourseLesson, hasFullAccess: boolean, userId?: string): CourseLesson {
    const isPreview = !!lesson.isFreePreview;
    const isAllowed = hasFullAccess || isPreview;

    // Sanitize resources
    const sanitizedResources: LessonResource[] = (lesson.resources || []).map(res => {
      const isPublicResource = res.isPublic;
      const canAccessRes = hasFullAccess || isPublicResource;

      if (!canAccessRes) {
        return {
          id: res.id,
          lessonId: res.lessonId,
          title: res.title,
          fileType: res.fileType,
          fileSize: res.fileSize,
          storageKey: '', // Strip raw storage key
          isPublic: false,
          createdAt: res.createdAt
        };
      }

      // If authorized, sign url if storageKey exists
      const downloadUrl = res.downloadUrl || (userId && res.storageKey ? this.generateSignedUrl(res.storageKey, userId) : undefined);

      return {
        ...res,
        storageKey: hasFullAccess ? res.storageKey : '', // Only expose raw storage key to authorized managers/instructors
        downloadUrl
      };
    });

    if (!isAllowed) {
      return {
        id: lesson.id,
        sectionId: lesson.sectionId,
        courseId: lesson.courseId,
        title: lesson.title,
        description: lesson.description,
        contentType: lesson.contentType,
        durationMinutes: lesson.durationMinutes,
        orderIndex: lesson.orderIndex,
        isFreePreview: false,
        // Redact protected content payloads
        videoUrl: undefined,
        audioUrl: undefined,
        pdfUrl: undefined,
        externalUrl: undefined,
        textContent: undefined,
        resources: sanitizedResources,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt
      };
    }

    return {
      ...lesson,
      resources: sanitizedResources
    };
  }

  /**
   * Sanitizes course object before sending to client
   */
  async sanitizeCourseForUser(
    course: Course,
    user?: { userId: string; roles: string[] }
  ): Promise<any> {
    const access = await this.evaluateUserCourseAccess(course, user);

    const sourceSections = (course.sections && course.sections.length > 0)
      ? course.sections
      : this.normalizeSections(course.id, (course as any).modules || []);

    const sanitizedSections = sourceSections.map(section => ({
      ...section,
      lessons: (section.lessons || []).map(lesson => 
        this.sanitizeLesson(lesson, access.canAccessFull, user?.userId)
      )
    }));

    const instructor = db.users.find(u => u.id === course.instructorId || u.id === (course as any).instructor?.id);
    const category = db.categories.find(c => c.id === course.categoryId || c.slug === course.categoryId);
    const totalLessons = sanitizedSections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0);

    return {
      ...course,
      instructorId: course.instructorId || instructor?.id || 'usr_inst_1',
      instructorName: (course as any).instructorName || instructor?.name || (instructor as any)?.title || 'مدرس ارشد لومینا',
      instructorAvatar: (course as any).instructorAvatar || instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      instructorTitle: (course as any).instructorTitle || (instructor as any)?.title || (instructor as any)?.headline || 'مدرس و متخصص ارشد',
      categoryName: (course as any).categoryName || category?.name || 'برنامه‌نویسی و فرانت‌اند',
      subtitle: course.shortDescription || (course as any).subtitle || (course.description ? course.description.substring(0, 120) : ''),
      requirements: course.prerequisites || (course as any).requirements || [],
      targetAudience: (course as any).targetAudience || ['علاقه‌مندان به یادگیری تخصصی و ورود به بازار کار حرفه‌ای'],
      lessonCount: (course as any).lessonCount || totalLessons,
      studentCount: course.enrolledStudentsCount || (course as any).studentCount || 0,
      reviewCount: course.reviewsCount || (course as any).reviewCount || 0,
      originalPrice: (course as any).originalPrice || course.price,
      previewVideoUrl: course.videoPreviewUrl || (course as any).previewVideoUrl || '',
      hasCertificate: (course as any).hasCertificate ?? true,
      faqs: (course as any).faqs || [
        { question: 'آیا برای شرکت در این دوره نیاز به پیش‌نیاز خاصی است؟', answer: 'خیر، مفاهیم پایه‌ای در فصل اول به طور کامل بازگو می‌شوند.' },
        { question: 'آیا دسترسی به ویدیوها دائمی خواهد بود؟', answer: 'بله، پس از ثبت‌نام دسترسی نامحدود و همیشگی به جلسات خواهید داشت.' }
      ],
      modules: sanitizedSections.map(sec => ({
        id: sec.id,
        title: sec.title,
        order: sec.orderIndex,
        lessons: sec.lessons.map(lsn => ({
          ...lsn,
          order: lsn.orderIndex,
          isPreviewFree: lsn.isFreePreview
        }))
      })),
      sections: sanitizedSections,
      userAccess: access
    };
  }

  async getAllPublished(
    filters?: { categoryId?: string; search?: string; level?: CourseLevel | string; instructorId?: string },
    user?: { userId: string; roles: string[] }
  ) {
    let list = db.courses.filter(c => c.status === 'PUBLISHED' && !c.deletedAt);

    if (filters?.categoryId && filters.categoryId !== 'all') {
      const targetCat = filters.categoryId;
      const dbCat = db.categories.find(c => c.id === targetCat || c.slug === targetCat);
      const catId = dbCat?.id || targetCat;
      list = list.filter(c => c.categoryId === catId || c.categoryId === targetCat);
    }

    if (filters?.level && filters.level !== 'all') {
      const targetLevel = filters.level.toUpperCase().replace(/\s+/g, '_');
      list = list.filter(c => {
        const cLevel = (c.level || '').toUpperCase().replace(/\s+/g, '_');
        return cLevel === targetLevel || cLevel === 'ALL_LEVELS' || targetLevel === 'ALL_LEVELS';
      });
    }

    if (filters?.instructorId && filters.instructorId !== 'all') {
      list = list.filter(c => c.instructorId === filters.instructorId);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(c => {
        const instructor = db.users.find(u => u.id === c.instructorId);
        const instName = instructor?.name?.toLowerCase() || '';
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.shortDescription && c.shortDescription.toLowerCase().includes(q)) ||
          (c.tagIds && c.tagIds.some(t => t.toLowerCase().includes(q))) ||
          instName.includes(q)
        );
      });
    }

    // Public catalog returns courses with sanitized sections (previews only for unauthenticated)
    return Promise.all(list.map(c => this.sanitizeCourseForUser(c, user)));
  }

  async getAllForAdminOrInstructor(userId: string, isSuperAdmin: boolean) {
    if (isSuperAdmin) {
      return db.courses.filter(c => !c.deletedAt);
    }
    return db.courses.filter(c => c.instructorId === userId && !c.deletedAt);
  }

  async getById(idOrSlug: string, user?: { userId: string; roles: string[] }) {
    const rawId = (idOrSlug || '').trim();
    let decodedId = rawId;
    try {
      decodedId = decodeURIComponent(rawId).trim();
    } catch {
      decodedId = rawId;
    }

    const lowerRaw = rawId.toLowerCase();
    const lowerDecoded = decodedId.toLowerCase();

    let course = db.courses.find(c => 
      !c.deletedAt && (
        c.id === rawId || 
        c.slug === rawId || 
        c.id === decodedId || 
        c.slug === decodedId ||
        c.id.toLowerCase() === lowerRaw ||
        c.slug.toLowerCase() === lowerRaw ||
        c.id.toLowerCase() === lowerDecoded ||
        c.slug.toLowerCase() === lowerDecoded ||
        // Support legacy & UI/UX alias slugs
        ((lowerRaw === 'modern-ui-ux-design-systems-mastery' || lowerDecoded === 'modern-ui-ux-design-systems-mastery') && (c.id === 'crs_figma_ui' || c.slug === 'figma-design-system-masterclass')) ||
        ((lowerRaw === 'course-1' || lowerDecoded === 'course-1') && (c.id === 'crs_react_pro' || c.slug === 'react-19-nextjs-masterclass'))
      )
    );

    // Fallback: If not found by direct slug or alias, check keywords
    if (!course) {
      if (lowerRaw.includes('modern-ui-ux') || lowerRaw.includes('design-system') || lowerDecoded.includes('modern-ui-ux')) {
        course = db.courses.find(c => !c.deletedAt && (c.id === 'crs_figma_ui' || c.slug.includes('figma') || c.categoryId === 'cat_uiux'));
      } else if (lowerRaw === 'course-1' || lowerDecoded === 'course-1') {
        course = db.courses.find(c => !c.deletedAt && (c.id === 'crs_react_pro' || c.slug.includes('react')));
      }
    }

    if (!course) {
      const error: any = new Error('دوره مورد نظر یافت نشد.');
      error.status = 404;
      error.code = 'COURSE_NOT_FOUND';
      throw error;
    }

    // Draft Safety: Only author or admins can view unpublished courses
    if (course.status !== 'PUBLISHED') {
      const isSuperAdmin = user && (user.roles.includes('OWNER') || user.roles.includes('ADMIN'));
      const isAuthor = user && user.userId === course.instructorId;
      if (!isSuperAdmin && !isAuthor) {
        const error: any = new Error('این دوره هنوز منتشر نشده است یا در وضعیت پیش‌نویس قرار دارد.');
        error.status = 403;
        error.code = 'COURSE_NOT_PUBLISHED';
        throw error;
      }
    }

    return this.sanitizeCourseForUser(course, user);
  }

  async getBySlugOrId(slugOrId: string, user?: { userId: string; roles: string[] }) {
    return this.getById(slugOrId, user);
  }

  async getLessonById(courseIdOrSlug: string, lessonId: string, user?: { userId: string; roles: string[] }) {
    const rawId = (courseIdOrSlug || '').trim();
    let decodedId = rawId;
    try {
      decodedId = decodeURIComponent(rawId).trim();
    } catch {
      decodedId = rawId;
    }

    const course = db.courses.find(c => 
      !c.deletedAt && (
        c.id === rawId || 
        c.slug === rawId || 
        c.id === decodedId || 
        c.slug === decodedId ||
        c.id.toLowerCase() === rawId.toLowerCase() ||
        c.slug.toLowerCase() === rawId.toLowerCase() ||
        c.id.toLowerCase() === decodedId.toLowerCase() ||
        c.slug.toLowerCase() === decodedId.toLowerCase()
      )
    );

    if (!course) {
      const err: any = new Error('دوره مورد نظر یافت نشد.');
      err.status = 404;
      err.code = 'COURSE_NOT_FOUND';
      throw err;
    }

    const access = await this.evaluateUserCourseAccess(course, user);

    let targetLesson: CourseLesson | undefined;
    for (const sec of course.sections || []) {
      const found = sec.lessons.find(l => l.id === lessonId);
      if (found) {
        targetLesson = found;
        break;
      }
    }

    if (!targetLesson) {
      const err: any = new Error('جلسه مورد نظر یافت نشد.');
      err.status = 404;
      err.code = 'LESSON_NOT_FOUND';
      throw err;
    }

    // Access Check: If not free preview and not full access -> throw 403 Forbidden
    if (!targetLesson.isFreePreview && !access.canAccessFull) {
      const isVip = Boolean(course.isVip || course.requiresSubscription);
      const err: any = new Error(
        isVip 
          ? 'دسترسی به این جلسه نیازمند اشتراک ویژه (VIP) فعال است. لطفاً اشتراک خود را تمدید یا فعال نمایید.'
          : 'دسترسی به این جلسه نیازمند ثبت‌نام یا اشتراک ویژه در پلتفرم است.'
      );
      err.status = 403;
      err.code = isVip ? 'FORBIDDEN_SUBSCRIPTION_REQUIRED' : 'FORBIDDEN_ACCESS';
      throw err;
    }

    return {
      courseId: course.id,
      courseTitle: course.title,
      lesson: this.sanitizeLesson(targetLesson, access.canAccessFull, user?.userId),
      userAccess: access
    };
  }

  /**
   * Video Stream Guard & Resolver
   * Validates access to raw lesson video streaming url
   */
  async getLessonStream(
    courseIdOrSlug: string,
    lessonId: string,
    user?: { userId: string; roles: string[] }
  ) {
    const rawId = String(courseIdOrSlug).trim();
    const decodedId = decodeURIComponent(rawId);

    const course = db.courses.find(
      c => !c.deletedAt && (
        c.id === rawId ||
        c.slug === rawId ||
        c.id === decodedId ||
        c.slug === decodedId ||
        c.id.toLowerCase() === rawId.toLowerCase() ||
        c.slug.toLowerCase() === rawId.toLowerCase()
      )
    );

    if (!course) {
      const err: any = new Error('دوره مورد نظر یافت نشد.');
      err.status = 404;
      err.code = 'COURSE_NOT_FOUND';
      throw err;
    }

    let targetLesson: CourseLesson | undefined;
    for (const sec of course.sections || []) {
      const found = sec.lessons.find(l => l.id === lessonId);
      if (found) {
        targetLesson = found;
        break;
      }
    }

    if (!targetLesson) {
      const err: any = new Error('جلسه مورد نظر یافت نشد.');
      err.status = 404;
      err.code = 'LESSON_NOT_FOUND';
      throw err;
    }

    const access = await this.evaluateUserCourseAccess(course, user);
    const isVip = Boolean(course.isVip || course.requiresSubscription);

    if (!targetLesson.isFreePreview && !access.canAccessFull) {
      const err: any = new Error(
        isVip
          ? 'پخش ویدئو این جلسه نیازمند اشتراک ویژه (VIP) فعال است. لطفاً اشتراک خود را فعال فرمایید.'
          : 'دسترسی به پخش ویدئو نیازمند ثبت‌نام در دوره است.'
      );
      err.status = 403;
      err.code = isVip ? 'FORBIDDEN_SUBSCRIPTION_REQUIRED' : 'FORBIDDEN_ACCESS';
      throw err;
    }

    return {
      courseId: course.id,
      courseTitle: course.title,
      lessonId: targetLesson.id,
      title: targetLesson.title,
      videoUrl: targetLesson.videoUrl,
      contentType: targetLesson.contentType,
      isFreePreview: !!targetLesson.isFreePreview,
      canAccessFull: access.canAccessFull
    };
  }

  normalizeSections(courseId: string, inputSectionsOrModules: any[]): CourseSection[] {
    if (!Array.isArray(inputSectionsOrModules)) return [];
    return inputSectionsOrModules.map((item, secIndex) => {
      const sectionId = item.id || `sec_${courseId}_${secIndex + 1}`;
      const lessons: CourseLesson[] = Array.isArray(item.lessons) ? item.lessons.map((lsn: any, lsnIndex: number) => {
        const lessonId = lsn.id || `lsn_${courseId}_${secIndex + 1}_${lsnIndex + 1}`;
        const rawType = (lsn.contentType || 'VIDEO').toUpperCase();
        const contentType: any = ['VIDEO', 'AUDIO', 'TEXT', 'PDF', 'QUIZ', 'ASSIGNMENT'].includes(rawType) ? rawType : 'VIDEO';
        
        return {
          id: lessonId,
          sectionId,
          courseId,
          title: lsn.title || `جلسه ${lsnIndex + 1}`,
          description: lsn.description || '',
          contentType,
          durationMinutes: Number(lsn.durationMinutes) || 10,
          videoUrl: lsn.videoUrl || '',
          audioUrl: lsn.audioUrl,
          textContent: lsn.textContent,
          pdfUrl: lsn.pdfUrl,
          externalUrl: lsn.externalUrl,
          isFreePreview: !!(lsn.isFreePreview ?? lsn.isPreviewFree),
          orderIndex: lsn.orderIndex ?? lsn.order ?? (lsnIndex + 1),
          resources: (lsn.resources || []).map((r: any, rIndex: number) => ({
            id: r.id || `res_${lessonId}_${rIndex + 1}`,
            lessonId,
            title: r.title || 'منبع آموزشی',
            fileType: (r.fileType || 'PDF').toUpperCase(),
            fileSize: r.fileSize || '1 MB',
            storageKey: r.storageKey || '',
            downloadUrl: r.downloadUrl,
            isPublic: !!r.isPublic,
            createdAt: r.createdAt || new Date().toISOString()
          })),
          createdAt: lsn.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }) : [];

      return {
        id: sectionId,
        courseId,
        title: item.title || `فصل ${secIndex + 1}`,
        orderIndex: item.orderIndex ?? item.order ?? (secIndex + 1),
        lessons,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  }

  async create(userId: string, isSuperAdminOrData: boolean | any, maybeData?: any) {
    const isSuperAdmin = typeof isSuperAdminOrData === 'boolean' ? isSuperAdminOrData : false;
    const data = (typeof isSuperAdminOrData === 'object' && isSuperAdminOrData !== null) ? isSuperAdminOrData : (maybeData || {});

    if (!data.title || !data.title.trim()) {
      const err: any = new Error('عنوان دوره الزامی است.');
      err.status = 400;
      throw err;
    }

    const now = new Date().toISOString();
    const id = data.id && data.id.startsWith('crs_') ? data.id : 'crs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);

    // If superadmin provided an explicit instructorId, use it; otherwise assign to the authenticated user
    const instructorId = isSuperAdmin && data.instructorId ? data.instructorId : userId;

    const rawSections = data.sections || data.modules || [];
    const sections = this.normalizeSections(id, rawSections);

    const totalDurationHours = data.durationHours ?? (
      sections.reduce((acc, s) => acc + s.lessons.reduce((lAcc, l) => lAcc + (l.durationMinutes || 0), 0), 0) / 60
    );

    const rawStatus = (data.status || 'DRAFT').toUpperCase();
    const status: CourseStatus = ['DRAFT', 'REVIEW', 'PENDING', 'PUBLISHED', 'ARCHIVED'].includes(rawStatus)
      ? (rawStatus === 'PENDING' ? 'REVIEW' : rawStatus as CourseStatus)
      : 'DRAFT';

    const price = data.price !== undefined ? Number(data.price) : 0;
    if (isNaN(price) || price < 0) {
      const err: any = new Error('قیمت دوره باید عددی نامنفی باشد.');
      err.status = 400;
      throw err;
    }

    let discountPrice: number | undefined = undefined;
    if (data.discountPercent !== undefined && data.discountPercent !== null && data.discountPercent !== '') {
      const discountPercent = Number(data.discountPercent);
      if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
        const err: any = new Error('درصد تخفیف باید بین ۰ تا ۱۰۰ درصد باشد.');
        err.status = 400;
        throw err;
      }
      if (price > 0 && data.discountPrice === undefined) {
        discountPrice = Math.round(price * (1 - discountPercent / 100));
      }
    }

    if (data.discountPrice !== undefined && data.discountPrice !== null && data.discountPrice !== '') {
      discountPrice = Number(data.discountPrice);
      if (isNaN(discountPrice) || discountPrice < 0) {
        const err: any = new Error('قیمت با تخفیف باید عددی نامنفی باشد.');
        err.status = 400;
        throw err;
      }
      if (discountPrice > price) {
        const err: any = new Error('قیمت با تخفیف نمی‌تواند از قیمت اصلی دوره بیشتر باشد.');
        err.status = 400;
        throw err;
      }
    }

    const newCourse: Course = {
      id,
      title: data.title.trim(),
      slug,
      shortDescription: data.shortDescription || data.subtitle || '',
      description: data.description || '',
      thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      videoPreviewUrl: data.videoPreviewUrl || data.previewVideoUrl,
      instructorId,
      categoryId: data.categoryId || 'cat_dev',
      tagIds: data.tagIds || data.tags || [],
      level: (data.level ? data.level.toUpperCase().replace(/\s+/g, '_') : 'BEGINNER') as CourseLevel,
      durationHours: Math.round(totalDurationHours * 10) / 10,
      language: data.language || 'fa',
      status,
      isFree: data.isFree ?? (price === 0),
      isVip: data.isVip !== undefined ? Boolean(data.isVip) : (data.requiresSubscription !== undefined ? Boolean(data.requiresSubscription) : !data.isFree),
      requiresSubscription: data.isVip !== undefined ? Boolean(data.isVip) : (data.requiresSubscription !== undefined ? Boolean(data.requiresSubscription) : !data.isFree),
      price,
      originalPrice: data.originalPrice !== undefined ? Number(data.originalPrice) : (data.isFree ? 0 : (price || 0)),
      discountPrice,
      prerequisites: data.prerequisites || data.requirements || [],
      whatYouWillLearn: data.whatYouWillLearn || [],
      rating: 5.0,
      reviewsCount: 0,
      enrolledStudentsCount: 0,
      sections,
      publishedAt: status === 'PUBLISHED' ? now : undefined,
      createdAt: now,
      updatedAt: now
    };

    db.courses.push(newCourse);
    return this.sanitizeCourseForUser(newCourse, { userId, roles: isSuperAdmin ? ['ADMIN'] : ['INSTRUCTOR'] });
  }

  async update(courseId: string, userId: string, isSuperAdminOrData: boolean | any, maybeData?: any) {
    const isSuperAdmin = typeof isSuperAdminOrData === 'boolean' ? isSuperAdminOrData : false;
    const data = (typeof isSuperAdminOrData === 'object' && isSuperAdminOrData !== null) ? isSuperAdminOrData : (maybeData || {});

    const course = db.courses.find(c => (c.id === courseId || c.slug === courseId) && !c.deletedAt);
    if (!course) {
      const err: any = new Error('دوره یافت نشد.');
      err.status = 404;
      err.code = 'COURSE_NOT_FOUND';
      throw err;
    }

    if (!isSuperAdmin && course.instructorId !== userId) {
      const err: any = new Error('شما دسترسی ویرایش دوره مدرس دیگر را ندارید.');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    if (data.title) course.title = data.title.trim();
    if (data.slug) course.slug = generateSlug(data.slug);
    if (data.shortDescription !== undefined || data.subtitle !== undefined) {
      course.shortDescription = data.shortDescription ?? data.subtitle;
    }
    if (data.description !== undefined) course.description = data.description;
    if (data.thumbnail) course.thumbnail = data.thumbnail;
    if (data.videoPreviewUrl !== undefined || data.previewVideoUrl !== undefined) {
      course.videoPreviewUrl = data.videoPreviewUrl ?? data.previewVideoUrl;
    }
    if (data.categoryId) course.categoryId = data.categoryId;
    if (data.level) {
      course.level = (data.level.toUpperCase().replace(/\s+/g, '_')) as CourseLevel;
    }
    if (data.status) {
      const rawStatus = data.status.toUpperCase();
      course.status = ['DRAFT', 'REVIEW', 'PENDING', 'PUBLISHED', 'ARCHIVED'].includes(rawStatus)
        ? (rawStatus === 'PENDING' ? 'REVIEW' : rawStatus as CourseStatus)
        : course.status;
      if (course.status === 'PUBLISHED' && !course.publishedAt) {
        course.publishedAt = new Date().toISOString();
      }
    }
    if (data.isFree !== undefined) course.isFree = Boolean(data.isFree);
    if (data.isVip !== undefined) {
      course.isVip = Boolean(data.isVip);
      course.requiresSubscription = Boolean(data.isVip);
    } else if (data.requiresSubscription !== undefined) {
      course.requiresSubscription = Boolean(data.requiresSubscription);
      course.isVip = Boolean(data.requiresSubscription);
    } else if (data.isFree === true) {
      course.requiresSubscription = false;
      course.isVip = false;
    }
    if (data.price !== undefined) {
      const parsedPrice = Number(data.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        const err: any = new Error('قیمت دوره باید عددی نامنفی باشد.');
        err.status = 400;
        throw err;
      }
      course.price = parsedPrice;
      if (course.price === 0 && data.isFree === undefined) {
        course.isFree = true;
      }
    }
    if (data.originalPrice !== undefined) {
      const parsedOriginal = Number(data.originalPrice);
      if (!isNaN(parsedOriginal) && parsedOriginal >= 0) {
        course.originalPrice = course.isFree ? 0 : parsedOriginal;
      }
    }
    if (data.discountPercent !== undefined) {
      if (data.discountPercent === null || data.discountPercent === '') {
        // keep or reset
      } else {
        const parsedPercent = Number(data.discountPercent);
        if (isNaN(parsedPercent) || parsedPercent < 0 || parsedPercent > 100) {
          const err: any = new Error('درصد تخفیف باید بین ۰ تا ۱۰۰ درصد باشد.');
          err.status = 400;
          throw err;
        }
        if (course.price > 0 && data.discountPrice === undefined) {
          course.discountPrice = Math.round(course.price * (1 - parsedPercent / 100));
        }
      }
    }
    if (data.discountPrice !== undefined) {
      if (data.discountPrice === null || data.discountPrice === '') {
        course.discountPrice = undefined;
      } else {
        const parsedDiscount = Number(data.discountPrice);
        if (isNaN(parsedDiscount) || parsedDiscount < 0) {
          const err: any = new Error('قیمت با تخفیف باید عددی نامنفی باشد.');
          err.status = 400;
          throw err;
        }
        const maxAllowed = Math.max(course.originalPrice || 0, course.price);
        if (parsedDiscount > maxAllowed) {
          const err: any = new Error('قیمت با تخفیف نمی‌تواند از قیمت اصلی دوره بیشتر باشد.');
          err.status = 400;
          throw err;
        }
        course.discountPrice = parsedDiscount;
      }
    }
    if (data.prerequisites || data.requirements) {
      course.prerequisites = data.prerequisites || data.requirements;
    }
    if (data.whatYouWillLearn) course.whatYouWillLearn = data.whatYouWillLearn;
    if (data.tagIds || data.tags) course.tagIds = data.tagIds || data.tags;

    if (data.sections || data.modules) {
      const rawSections = data.sections || data.modules;
      course.sections = this.normalizeSections(course.id, rawSections);
      course.durationHours = Math.round((course.sections.reduce((acc, s) => acc + s.lessons.reduce((lAcc, l) => lAcc + (l.durationMinutes || 0), 0), 0) / 60) * 10) / 10;
    }

    if (isSuperAdmin && data.instructorId) {
      course.instructorId = data.instructorId;
    }

    course.updatedAt = new Date().toISOString();
    return this.sanitizeCourseForUser(course, { userId, roles: isSuperAdmin ? ['ADMIN'] : ['INSTRUCTOR'] });
  }

  async updateStatus(courseId: string, userIdOrStatus: string, isSuperAdminOrUndefined?: boolean, maybeStatus?: string) {
    const isDirect = typeof isSuperAdminOrUndefined !== 'boolean';
    const rawStatus = isDirect ? userIdOrStatus : (maybeStatus || 'DRAFT');
    const userId = isDirect ? 'usr_admin_1' : userIdOrStatus;
    const isSuperAdmin = isDirect ? true : isSuperAdminOrUndefined;

    const course = db.courses.find(c => (c.id === courseId || c.slug === courseId) && !c.deletedAt);
    if (!course) {
      const err: any = new Error('دوره یافت نشد.');
      err.status = 404;
      err.code = 'COURSE_NOT_FOUND';
      throw err;
    }

    if (!isSuperAdmin && course.instructorId !== userId) {
      const err: any = new Error('شما دسترسی تغییر وضعیت دوره مدرس دیگر را ندارید.');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    const norm = (rawStatus || '').toUpperCase();
    const status: CourseStatus = ['DRAFT', 'REVIEW', 'PENDING', 'PUBLISHED', 'ARCHIVED'].includes(norm)
      ? (norm === 'PENDING' ? 'REVIEW' : norm as CourseStatus)
      : 'DRAFT';

    course.status = status;
    if (status === 'PUBLISHED' && !course.publishedAt) {
      course.publishedAt = new Date().toISOString();
    }
    course.updatedAt = new Date().toISOString();
    return this.sanitizeCourseForUser(course, { userId, roles: isSuperAdmin ? ['ADMIN'] : ['INSTRUCTOR'] });
  }

  async delete(courseId: string, userIdOrUndefined?: string, isSuperAdminOrUndefined?: boolean) {
    const course = db.courses.find(c => (c.id === courseId || c.slug === courseId) && !c.deletedAt);
    if (!course) {
      const err: any = new Error('دوره یافت نشد.');
      err.status = 404;
      err.code = 'COURSE_NOT_FOUND';
      throw err;
    }

    const isSuperAdmin = isSuperAdminOrUndefined !== undefined ? isSuperAdminOrUndefined : true;
    const userId = userIdOrUndefined || 'usr_admin_1';

    if (!isSuperAdmin && course.instructorId !== userId) {
      const err: any = new Error('شما دسترسی حذف دوره مدرس دیگر را ندارید.');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    if (!isSuperAdmin && course.instructorId !== userId) {
      const err: any = new Error('شما اجازه حذف دوره مدرس دیگر را ندارید.');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    course.deletedAt = new Date().toISOString();
    course.status = 'ARCHIVED';
    return { success: true, message: 'دوره با موفقیت حذف/آرشیو شد.' };
  }

  // Dedicated Section & Lesson operations
  async addSection(courseId: string, userId: string, isSuperAdmin: boolean, title: string) {
    const course = db.courses.find(c => (c.id === courseId || c.slug === courseId) && !c.deletedAt);
    if (!course) {
      const err: any = new Error('دوره یافت نشد.');
      err.status = 404;
      throw err;
    }
    if (!isSuperAdmin && course.instructorId !== userId) {
      const err: any = new Error('شما دسترسی به این دوره را ندارید.');
      err.status = 403;
      throw err;
    }

    const newSection: CourseSection = {
      id: `sec_${course.id}_${Date.now()}`,
      courseId: course.id,
      title: title || `فصل ${(course.sections?.length || 0) + 1}`,
      orderIndex: (course.sections?.length || 0) + 1,
      lessons: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!course.sections) course.sections = [];
    course.sections.push(newSection);
    course.updatedAt = new Date().toISOString();

    return { course: await this.sanitizeCourseForUser(course, { userId, roles: isSuperAdmin ? ['ADMIN'] : ['INSTRUCTOR'] }), section: newSection };
  }

  async addLesson(courseId: string, sectionId: string, userId: string, isSuperAdmin: boolean, lessonData: any) {
    const course = db.courses.find(c => (c.id === courseId || c.slug === courseId) && !c.deletedAt);
    if (!course) {
      const err: any = new Error('دوره یافت نشد.');
      err.status = 404;
      throw err;
    }
    if (!isSuperAdmin && course.instructorId !== userId) {
      const err: any = new Error('شما دسترسی به این دوره را ندارید.');
      err.status = 403;
      throw err;
    }

    const section = (course.sections || []).find(s => s.id === sectionId);
    if (!section) {
      const err: any = new Error('سرفصل مورد نظر یافت نشد.');
      err.status = 404;
      throw err;
    }

    const newLesson: CourseLesson = {
      id: `lsn_${course.id}_${Date.now()}`,
      sectionId,
      courseId: course.id,
      title: lessonData.title || `جلسه ${section.lessons.length + 1}`,
      description: lessonData.description || '',
      contentType: (lessonData.contentType || 'VIDEO').toUpperCase(),
      durationMinutes: Number(lessonData.durationMinutes) || 10,
      videoUrl: lessonData.videoUrl || '',
      audioUrl: lessonData.audioUrl,
      textContent: lessonData.textContent,
      pdfUrl: lessonData.pdfUrl,
      externalUrl: lessonData.externalUrl,
      isFreePreview: !!(lessonData.isFreePreview ?? lessonData.isPreviewFree),
      orderIndex: section.lessons.length + 1,
      resources: lessonData.resources || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    section.lessons.push(newLesson);
    course.updatedAt = new Date().toISOString();

    return { course: await this.sanitizeCourseForUser(course, { userId, roles: isSuperAdmin ? ['ADMIN'] : ['INSTRUCTOR'] }), lesson: newLesson };
  }
}

export const courseService = new CourseService();
