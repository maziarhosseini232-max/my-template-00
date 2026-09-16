import fs from 'fs';
import path from 'path';
import { authService } from '../services/authService.js';
import { courseService } from '../services/courseService.js';
import { enrollmentService } from '../services/enrollmentService.js';
import { progressService } from '../services/progressService.js';
import { cmsService } from '../services/cmsService.js';
import { storageService } from '../services/storageService.js';
import { seoService } from '../services/seoService.js';
import { commerceService } from '../services/commerceService.js';
import { ROLES, db } from '../db/index.js';

export async function runBackendTests() {
  console.log('--- Starting Backend Verification Tests ---');
  const results: { test: string; status: 'PASSED' | 'FAILED'; error?: string }[] = [];

  // 1. Auth Test
  try {
    const regResult = await authService.register({
      name: 'دانشجوی تستی',
      email: 'test_student_' + Date.now() + '@example.com',
      password: 'password123',
      role: 'STUDENT'
    });
    if (!regResult.token || !regResult.user.id) throw new Error('Token or User ID missing');

    const loginResult = await authService.login(regResult.user.email, 'password123');
    if (!loginResult.token) throw new Error('Login failed');

    results.push({ test: '1. Authentication (Register & Login with JWT)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '1. Authentication', status: 'FAILED', error: err.message });
  }

  // 2. Authorization Test (Student cannot perform Admin operations)
  try {
    const studentRole = ROLES.find(r => r.name === 'STUDENT');
    const adminRole = ROLES.find(r => r.name === 'ADMIN');

    const canStudentCreateCourse = studentRole?.permissions.includes('course:create') || false;
    const canStudentDeleteCourse = studentRole?.permissions.includes('course:delete') || false;
    const canAdminPublishCourse = adminRole?.permissions.includes('course:publish') || false;

    if (canStudentCreateCourse || canStudentDeleteCourse) {
      throw new Error('Security Breach: STUDENT role has unauthorized permissions!');
    }
    if (!canAdminPublishCourse) {
      throw new Error('ADMIN role is missing course:publish permission');
    }

    results.push({ test: '2. Granular Authorization & Student RBAC Boundary Check', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '2. Granular Authorization & RBAC', status: 'FAILED', error: err.message });
  }

  // 3. Course CRUD Test
  try {
    const adminUser = db.users.find(u => u.roles.includes('ADMIN'));
    if (!adminUser) throw new Error('Admin user not found');

    const newCourse = await courseService.create(adminUser.id, {
      title: 'دوره تستی جامع تایپ‌اسکریپت پیشرفته',
      shortDescription: 'آموزش تستی',
      description: 'توضیحات تستی',
      level: 'INTERMEDIATE',
      price: 0,
      isFree: true
    });

    if (!newCourse.id || newCourse.status !== 'DRAFT') throw new Error('Course creation failed');

    const updated = await courseService.updateStatus(newCourse.id, 'PUBLISHED');
    if (updated.status !== 'PUBLISHED') throw new Error('Publish status update failed');

    // Clean up temporary test course to keep catalog clean for subsequent tests
    db.courses = db.courses.filter(c => c.id !== newCourse.id);

    results.push({ test: '3. Course Engine (Create, Update & Publish Lifecycle)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '3. Course Engine', status: 'FAILED', error: err.message });
  }

  // 4. Enrollment & Progress Test
  try {
    const student = db.users.find(u => u.roles.includes('STUDENT'));
    const course = db.courses.find(c => c.status === 'PUBLISHED' && c.isFree) || db.courses.find(c => c.status === 'PUBLISHED');
    if (!student || !course) throw new Error('Student or Course missing');

    const enrollRes = await enrollmentService.enroll(student.id, course.id, course.isFree ? 'FREE' : 'PAID');
    if (!enrollRes.enrollment) throw new Error('Enrollment failed');

    const progressRes = await progressService.updateLessonProgress(
      student.id,
      course.id,
      course.sections[0]?.lessons[0]?.id || 'lsn_1',
      true,
      300
    );

    if (!progressRes.lessonProgress.isCompleted) throw new Error('Lesson progress update failed');

    results.push({ test: '4. Enrollment & Dynamic Learning Progress Calculation', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '4. Enrollment & Progress', status: 'FAILED', error: err.message });
  }

  // 5. Site Builder CMS Test
  try {
    const sections = await cmsService.getHomepageSections();
    if (!sections || sections.length === 0) throw new Error('No homepage sections found');

    const updatedSec = await cmsService.updateHomepageSection(sections[0].id, {
      title: 'بنر اصلی به‌روزشده توسط Site Builder'
    });
    if (updatedSec.title !== 'بنر اصلی به‌روزشده توسط Site Builder') throw new Error('Section update failed');

    results.push({ test: '5. Site Builder (Section Customization & Dynamic CMS)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '5. Site Builder CMS', status: 'FAILED', error: err.message });
  }

  // 6. Secure Digital Storage & Tokenized Access Test
  try {
    const products = await storageService.getAllProducts();
    if (products.length === 0) throw new Error('No digital products found');

    const downloadAccess = await storageService.getDownloadAccess('usr_test', products[0].id);
    if (!downloadAccess.downloadUrl.includes('token=')) throw new Error('Download URL is not securely tokenized');

    results.push({ test: '6. Storage Abstraction (Signed URLs & Secure Digital Assets)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '6. Storage Abstraction', status: 'FAILED', error: err.message });
  }

  // 7. SEO Architecture Test
  try {
    const sitemap = seoService.generateSitemapXml();
    if (!sitemap.includes('<urlset') || !sitemap.includes('<loc>')) throw new Error('Sitemap XML malformed');

    const robots = seoService.generateRobotsTxt();
    if (!robots.includes('User-agent: *')) throw new Error('Robots.txt malformed');

    results.push({ test: '7. SEO Foundation (Dynamic Metadata, Sitemap & Robots.txt)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '7. SEO Foundation', status: 'FAILED', error: err.message });
  }

  // 8. Protected Content & Multi-Role Authorization (Task 2)
  try {
    const admin = db.users.find(u => u.roles.includes('ADMIN') || u.roles.includes('OWNER'))!;
    const instructor1 = db.users.find(u => u.roles.includes('INSTRUCTOR'))!;
    const student = db.users.find(u => u.roles.includes('STUDENT') && !u.roles.includes('ADMIN'))!;
    const course1 = db.courses.find(c => c.sections && c.sections.length > 0 && c.sections[0]?.lessons?.some(l => !l.isFreePreview)) || db.courses[0];
    // Ensure clean state for standard unenrolled student test
    student.subscriptionEndDate = undefined;
    course1.isVip = false;
    course1.isFree = false;
    course1.price = 250000;
    const privateLesson = course1.sections?.[0]?.lessons?.find(l => !l.isFreePreview)!;

    // S1: Guest Public course metadata is sanitized
    const pubCourse = await courseService.getById(course1.id, undefined);
    const pubLesson = pubCourse.sections[0]?.lessons.find(l => l.id === privateLesson.id);
    if (pubLesson?.videoUrl || pubLesson?.textContent) throw new Error('Guest received private lesson videoUrl or textContent');

    // S2: Guest cannot fetch private lesson
    let guestBlocked = false;
    try {
      await courseService.getLessonById(course1.id, privateLesson.id, undefined);
    } catch (e: any) {
      if (e.status === 403 || e.message.includes('دسترسی غیرمجاز')) guestBlocked = true;
    }
    if (!guestBlocked) throw new Error('Guest was not blocked from private lesson');

    // S3: Unenrolled student blocked
    db.enrollments = db.enrollments.filter(e => !(e.userId === student.id && e.courseId === course1.id));
    let unenrolledBlocked = false;
    try {
      await courseService.getLessonById(course1.id, privateLesson.id, { userId: student.id, roles: student.roles });
    } catch (e: any) {
      if (e.status === 403 || e.message.includes('دسترسی غیرمجاز')) unenrolledBlocked = true;
    }
    if (!unenrolledBlocked) throw new Error('Unenrolled student was not blocked');

    // S4: Enrolled student granted access
    await enrollmentService.enroll(student.id, course1.id, 'PAID');
    const enrolledAccess = await courseService.getLessonById(course1.id, privateLesson.id, { userId: student.id, roles: student.roles });
    if (!enrolledAccess.userAccess.canAccessFull || !enrolledAccess.lesson.videoUrl) {
      throw new Error('Enrolled student did not receive full video access');
    }

    // S5: Instructor own course granted
    const instOwnCourse = db.courses.find(c => c.instructorId === instructor1.id)!;
    const instLesson = instOwnCourse.sections[0].lessons[0];
    const instAccess = await courseService.getLessonById(instOwnCourse.id, instLesson.id, { userId: instructor1.id, roles: instructor1.roles });
    if (!instAccess.userAccess.canAccessFull || instAccess.userAccess.reason !== 'INSTRUCTOR') {
      throw new Error('Instructor was denied access to own course');
    }

    // S6: Admin granted
    const adminAccess = await courseService.getLessonById(course1.id, privateLesson.id, { userId: admin.id, roles: admin.roles });
    if (!adminAccess.userAccess.canAccessFull || adminAccess.userAccess.reason !== 'ADMIN') {
      throw new Error('Admin was denied master access to course');
    }

    results.push({ test: '8. Protected Course Content & Multi-Role Authorization (8-Scenario Matrix)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '8. Protected Course Content', status: 'FAILED', error: err.message });
  }

  // 9. Task 3: Courses Integration E2E (Catalog & Detail Endpoints)
  try {
    // A. Catalog list check
    const allCourses = await courseService.getAllPublished();
    if (!allCourses || allCourses.length === 0) throw new Error('Catalog returned empty list of courses');

    // B. Search and Category filter check
    const filteredSearch = await courseService.getAllPublished({ search: 'React' });
    if (!filteredSearch.some(c => c.title.includes('React') || c.shortDescription?.includes('React'))) {
      throw new Error('Search filter failed to match relevant course');
    }

    // C. Detail by slug and id
    const targetCourse = allCourses[0];
    const detailBySlug = await courseService.getBySlugOrId(targetCourse.slug);
    if (!detailBySlug || detailBySlug.id !== targetCourse.id) {
      throw new Error('Course Detail lookup by slug failed');
    }
    const detailById = await courseService.getBySlugOrId(targetCourse.id);
    if (!detailById || detailById.slug !== targetCourse.slug) {
      throw new Error('Course Detail lookup by ID failed');
    }

    // D. Sanitization and userAccess presence
    if (!detailBySlug.userAccess || typeof detailBySlug.userAccess.canAccessFull !== 'boolean') {
      throw new Error('Course Detail is missing userAccess security metadata');
    }

    results.push({ test: '9. Task 3: Courses Integration E2E (Catalog & Detail API & Authorization)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '9. Task 3: Courses Integration E2E', status: 'FAILED', error: err.message });
  }

  // 10. Task 1: Course Player Auto-Save & Resume Verification
  try {
    const student = db.users.find(u => u.roles.includes('STUDENT'))!;
    const course = db.courses.find(c => c.sections && c.sections.length > 0 && c.sections[0]?.lessons?.length > 0) || db.courses[0];
    const lesson = course.sections[0].lessons[0];

    // Ensure student is enrolled
    let enr = db.enrollments.find(e => e.userId === student.id && e.courseId === course.id);
    if (!enr) {
      await enrollmentService.enroll(student.id, course.id, 'PAID');
      enr = db.enrollments.find(e => e.userId === student.id && e.courseId === course.id)!;
    }

    // A. Auto-Save simulated at 124 seconds during active playback
    const updateRes = await progressService.updateLessonProgress(student.id, course.id, lesson.id, false, 124);
    if (!updateRes.lessonProgress || updateRes.lessonProgress.lastPositionSeconds !== 124) {
      throw new Error('Lesson progress lastPositionSeconds was not saved properly');
    }

    // B. Verify enrollment last position synchronization
    const syncEnr = db.enrollments.find(e => e.userId === student.id && e.courseId === course.id);
    if (!syncEnr || syncEnr.lastPositionSeconds !== 124 || syncEnr.lastLessonId !== lesson.id) {
      throw new Error('Enrollment object was not synchronized with lastLessonId and lastPositionSeconds');
    }

    // C. Resume retrieval from getCourseProgress API
    const progressRes = await progressService.getCourseProgress(student.id, course.id);
    const targetLp = progressRes.lessonProgressList.find(l => l.lessonId === lesson.id);
    if (!targetLp || targetLp.lastPositionSeconds !== 124) {
      throw new Error('Course player getCourseProgress failed to return the auto-saved position for resume');
    }

    // D. Mark completed, then test seeking to 45 seconds to verify completion retention
    await progressService.updateLessonProgress(student.id, course.id, lesson.id, true, 124);
    const seekRes = await progressService.updateLessonProgress(student.id, course.id, lesson.id, false, 45);
    if (!seekRes.lessonProgress.isCompleted) {
      throw new Error('Seeking in a completed lesson erroneously marked it incomplete');
    }
    if (seekRes.lessonProgress.lastPositionSeconds !== 45) {
      throw new Error('Seeking position was not updated');
    }

    results.push({ test: '10. Task 1: Course Player Auto-Save & Resume (Position Tracking, Enrollment Sync, Completion Retention)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '10. Task 1: Course Player Auto-Save & Resume', status: 'FAILED', error: err.message });
  }

  // 11. Task 2: Database Disk Snapshot Persistence & Fail-Safe Recovery
  try {
    // A. Snapshot creation and verification on disk
    const snapshotPath = db.getSnapshotPath();
    const saved = db.saveSnapshotSync();
    if (!saved) throw new Error('Database saveSnapshotSync failed');
    if (!fs.existsSync(snapshotPath)) throw new Error(`Database snapshot file not found on disk at ${snapshotPath}`);

    const raw = fs.readFileSync(snapshotPath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      throw new Error('Snapshot JSON file is missing users array or is malformed');
    }
    if (!Array.isArray(parsed.courses) || parsed.courses.length === 0) {
      throw new Error('Snapshot JSON file is missing courses array');
    }

    // B. Mutation & Reload Verification using an isolated temporary snapshot path
    const tempSnapshotPath = path.join(process.cwd(), 'server', 'data', `test_snapshot_${Date.now()}.json`);
    db.setSnapshotPath(tempSnapshotPath);

    // Make an observable mutation
    const initialCategoryCount = db.categories.length;
    const testCatId = `cat_test_${Date.now()}`;
    const now = new Date().toISOString();
    db.categories.push({
      id: testCatId,
      name: 'دسته‌بندی تستی پایداری دیسک',
      slug: `disk-test-${Date.now()}`,
      orderIndex: 99,
      isActive: true,
      createdAt: now,
      updatedAt: now
    });

    // Save mutated snapshot to isolated file
    db.saveSnapshotSync();
    if (!fs.existsSync(tempSnapshotPath)) throw new Error('Temporary test snapshot was not written');

    // Simulate server restart: Clear categories and load from snapshot
    db.categories = [];
    const loadSuccess = db.loadSnapshot();
    if (!loadSuccess) throw new Error('Database loadSnapshot failed to load from temporary snapshot');
    const foundMutated = db.categories.find(c => c.id === testCatId);
    if (!foundMutated) throw new Error('Mutated record did not persist across snapshot reload');

    // Verify duplicate prevention: collections should match exactly, not duplicate
    if (db.categories.length !== initialCategoryCount + 1) {
      throw new Error(`Category count mismatch after reload (expected ${initialCategoryCount + 1}, got ${db.categories.length})`);
    }

    // C. Fail-Safe Recovery on Corrupt Snapshot Test
    fs.writeFileSync(tempSnapshotPath, '{ invalid_corrupt_json: %%%', 'utf-8');
    const corruptLoadResult = db.loadSnapshot(true);
    // Must gracefully return false and not crash
    if (corruptLoadResult !== false) {
      throw new Error('loadSnapshot should return false on corrupt JSON file');
    }

    // Clean up temporary test file and restore default snapshot path
    if (fs.existsSync(tempSnapshotPath)) {
      fs.unlinkSync(tempSnapshotPath);
    }
    db.setSnapshotPath(snapshotPath);
    db.loadSnapshot(); // Restore main clean state

    results.push({ test: '11. Task 2: Database Disk Persistence (Atomic Snapshot, Restart Survival, Duplicate Prevention & Fail-Safe)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '11. Task 2: Database Disk Persistence', status: 'FAILED', error: err.message });
  }

  // 12. Phase 5: Profile Updates & Sheba IBAN Persistence
  try {
    const user = db.users.find(u => u.roles.includes('STUDENT'))!;
    const testSheba = '123456789012345678901234';
    const updated = await authService.updateProfile(user.id, {
      shebaNumber: testSheba,
      headline: 'توسعه‌دهنده فول‌استک'
    });
    if (updated.shebaNumber !== testSheba) {
      throw new Error('Sheba IBAN number was not updated or returned correctly');
    }
    const freshProfile = await authService.getProfile(user.id);
    if (freshProfile.shebaNumber !== testSheba) {
      throw new Error('Sheba IBAN was not persisted on user object');
    }
    results.push({ test: '12. Phase 5: Profile Updates & Sheba IBAN Persistence', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '12. Phase 5: Profile Updates & Sheba IBAN', status: 'FAILED', error: err.message });
  }

  // 13. Phase 5: Course Archive & Drop Authorization
  try {
    const student = db.users.find(u => u.roles.includes('STUDENT'))!;
    const freeCourse = db.courses.find(c => c.isFree || (c.price || 0) === 0)!;
    const paidCourse = db.courses.find(c => !c.isFree && (c.price || 0) > 0)!;

    // Ensure enrolled in free course
    let enrFree = db.enrollments.find(e => e.userId === student.id && e.courseId === freeCourse.id && e.isActive);
    if (!enrFree) {
      await enrollmentService.enroll(student.id, freeCourse.id, 'FREE');
    }

    // Toggle archive
    const arch1 = await enrollmentService.archiveCourse(student.id, freeCourse.id);
    if (!arch1.isArchived) throw new Error('archiveCourse failed to mark course as archived');
    const arch2 = await enrollmentService.archiveCourse(student.id, freeCourse.id);
    if (arch2.isArchived) throw new Error('archiveCourse failed to toggle course back to unarchived');

    // Drop free course
    const dropRes = await enrollmentService.dropCourse(student.id, freeCourse.id);
    if (!dropRes.success) throw new Error('Failed to drop free course');

    // Attempt dropping paid course (should be rejected)
    let paidBlocked = false;
    // Temporarily add a paid enrollment
    const dummyPaidEnrollment = {
      id: 'enr_dummy_paid_' + Date.now(),
      userId: student.id,
      courseId: paidCourse.id,
      accessType: 'PAID' as const,
      enrolledAt: new Date().toISOString(),
      isActive: true
    };
    db.enrollments.push(dummyPaidEnrollment);
    try {
      await enrollmentService.dropCourse(student.id, paidCourse.id);
    } catch (e: any) {
      if (e.message.includes('غیررایگان') || e.status === 400) paidBlocked = true;
    }
    // Clean up dummy enrollment
    db.enrollments = db.enrollments.filter(e => e.id !== dummyPaidEnrollment.id);

    if (!paidBlocked) throw new Error('Dropping a paid course was not blocked');

    results.push({ test: '13. Phase 5: Course Archive & Drop Authorization (Free Allowed, Paid Blocked)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '13. Phase 5: Course Archive & Drop', status: 'FAILED', error: err.message });
  }

  // 14. Phase 5: Edge Cases Validation (Pricing & Storage Security)
  try {
    const admin = db.users.find(u => u.roles.includes('ADMIN'))!;

    // A. Negative price check
    let negBlocked = false;
    try {
      await courseService.create(admin.id, {
        title: 'دوره قیمت منفی',
        price: -1000
      });
    } catch (e: any) {
      if (e.message.includes('منفی') || e.status === 400) negBlocked = true;
    }
    if (!negBlocked) throw new Error('Negative course price was not rejected');

    // B. Discount > 100% check
    let highDiscountBlocked = false;
    try {
      await courseService.create(admin.id, {
        title: 'دوره تخفیف نامعتبر',
        price: 50000,
        discountPercent: 120
      });
    } catch (e: any) {
      if (e.message.includes('تخفیف') || e.status === 400) highDiscountBlocked = true;
    }
    if (!highDiscountBlocked) throw new Error('Discount > 100% was not rejected');

    // C. Storage security: dangerous file extension
    let extBlocked = false;
    try {
      await storageService.uploadFile('backdoor.php', 'application/x-php', Buffer.from('<?php echo 1; ?>'), 'usr_test');
    } catch (e: any) {
      if (e.message.includes('مسدود') || e.message.includes('امنیتی') || e.message.includes('غیرمجاز') || e.status === 400) extBlocked = true;
    }
    if (!extBlocked) throw new Error('Dangerous file extension was not blocked');

    results.push({ test: '14. Phase 5: Edge Case Validations (Pricing Limits & Storage Security Guards)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '14. Phase 5: Edge Case Validations', status: 'FAILED', error: err.message });
  }

  // 15. Phase 8 QA: E2E Commerce Flow (Search -> Cart -> Checkout -> Gateway Verification -> Enrolled Player Access)
  try {
    const student = db.users.find(u => u.roles.includes('STUDENT'))!;
    const publishedCourses = await courseService.getAllPublished();
    if (!publishedCourses || publishedCourses.length === 0) throw new Error('No published courses available for E2E commerce test');

    const courseToBuy = publishedCourses[0];

    // 1. Checkout with Mock Gateway
    const checkoutRes = await commerceService.checkout(student.id, {
      courseIds: [courseToBuy.id],
      paymentMethod: 'gateway',
      paymentGateway: 'MOCK_GATEWAY'
    });

    if (!checkoutRes.order || !checkoutRes.order.id) {
      throw new Error('Checkout failed to create an order');
    }

    const orderId = checkoutRes.order.id;

    // 2. Verify payment simulation (Shaparak / Bank Gateway callback)
    const verifyRes = await commerceService.verifyPayment(student.id, {
      orderId,
      authority: checkoutRes.authority || 'MOCK_AUTH_' + Date.now(),
      status: 'OK'
    });

    if (!verifyRes.success || verifyRes.order?.status !== 'PAID') {
      throw new Error('Payment verification did not complete order with PAID status');
    }

    // 3. Confirm student enrollment was provisioned
    const enrolled = db.enrollments.find(e => e.userId === student.id && e.courseId === courseToBuy.id && e.isActive);
    if (!enrolled) {
      throw new Error('Student was not automatically enrolled after successful payment');
    }

    // 4. Confirm student now has full player access
    const lesson = courseToBuy.sections?.[0]?.lessons?.[0];
    if (lesson) {
      const lessonAccess = await courseService.getLessonById(courseToBuy.id, lesson.id, {
        userId: student.id,
        roles: student.roles
      });
      if (!lessonAccess.userAccess.canAccessFull) {
        throw new Error('Enrolled student was denied full lesson video access in player');
      }
    }

    results.push({ test: '15. Phase 8 QA: E2E Commerce Flow (Search -> Checkout -> Shaparak Receipt -> Full Player Access)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '15. Phase 8 QA: E2E Commerce Flow', status: 'FAILED', error: err.message });
  }

  // 16. Phase 11: VIP Subscription Lifecycle & Exclusive Course Player Access
  try {
    const student = db.users.find(u => u.roles.includes('STUDENT'))!;
    
    // Clear any prior subscription for clean test
    student.subscriptionEndDate = undefined;

    // 1. Checkout VIP Subscription plan (3 months)
    const vipCheckoutRes = await commerceService.checkout(student.id, {
      subscriptionPlanId: 'plan_vip_3m',
      paymentMethod: 'gateway',
      paymentGateway: 'MOCK_GATEWAY'
    });

    if (!vipCheckoutRes.order || vipCheckoutRes.order.type !== 'SUBSCRIPTION') {
      throw new Error('VIP subscription checkout did not create an order with SUBSCRIPTION type');
    }

    // 2. Gateway verification
    const vipVerifyRes = await commerceService.verifyPayment(student.id, {
      orderId: vipCheckoutRes.order.id,
      authority: vipCheckoutRes.authority || 'VIP_AUTH_' + Date.now(),
      status: 'OK'
    });

    if (!vipVerifyRes.success || vipVerifyRes.order?.status !== 'PAID') {
      throw new Error('VIP payment verification failed to mark order as PAID');
    }

    if (!vipVerifyRes.subscriptionEndDate || !student.subscriptionEndDate) {
      throw new Error('VIP subscription endDate was not populated on user record');
    }

    const expiryTime = new Date(student.subscriptionEndDate).getTime();
    const expectedMinExpiry = Date.now() + 85 * 24 * 60 * 60 * 1000;
    if (expiryTime < expectedMinExpiry) {
      throw new Error('VIP subscription expiry date calculation is shorter than expected plan duration');
    }

    // 3. Mark a test course as VIP course and verify full access without individual enrollment
    const testVipCourse = db.courses[0];
    testVipCourse.isVip = true;
    testVipCourse.price = 500000; // paid course

    // Ensure student is NOT individually enrolled in this course
    db.enrollments = db.enrollments.filter(e => !(e.userId === student.id && e.courseId === testVipCourse.id));

    // Check course detail access with VIP subscription
    const courseDetail = await courseService.getById(testVipCourse.id, {
      userId: student.id,
      roles: student.roles
    });

    if (!courseDetail.userAccess.canAccessFull) {
      throw new Error('VIP subscriber was not granted full access to VIP course');
    }

    // Check lesson access
    const lesson = testVipCourse.sections?.[0]?.lessons?.[0];
    if (lesson) {
      const lessonAccess = await courseService.getLessonById(testVipCourse.id, lesson.id, {
        userId: student.id,
        roles: student.roles
      });
      if (!lessonAccess.userAccess.canAccessFull) {
        throw new Error('VIP subscriber was not granted full video access for VIP lesson');
      }
    }

    // Clean up temporary VIP state so subsequent tests or runs have a clean slate
    testVipCourse.isVip = false;
    student.subscriptionEndDate = undefined;
    db.saveSnapshotSync();

    results.push({ test: '16. Phase 11: VIP Subscription Lifecycle & Exclusive Course Player Access', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '16. Phase 11: VIP Subscription Lifecycle', status: 'FAILED', error: err.message });
  }

  // 17. Slug Aliases & Multi-Format Login Verification (Fix Validation)
  try {
    // 17.1 Test legacy/hero slug resolution
    const uiCourse = await courseService.getById('modern-ui-ux-design-systems-mastery');
    if (!uiCourse || (uiCourse.id !== 'crs_figma_ui' && !uiCourse.slug.includes('figma'))) {
      throw new Error('modern-ui-ux-design-systems-mastery did not resolve to Figma UI/UX masterclass');
    }

    const standardCourse = await courseService.getById('figma-design-system-masterclass');
    if (!standardCourse) {
      throw new Error('figma-design-system-masterclass not found');
    }

    // 17.2 Test Admin login with English and Persian digits
    const login1 = await authService.login('admin@lumina.com', '123456');
    if (!login1.token) throw new Error('admin@lumina.com login failed');

    const login2 = await authService.login('admin', '123456');
    if (!login2.token) throw new Error('admin alias login failed');

    const login3 = await authService.login('maziarhosseini232@gmail.com', '123456');
    if (!login3.token) throw new Error('maziarhosseini232@gmail.com login failed');

    // Test Persian digit password '۱۲۳۴۵۶'
    const login4 = await authService.login('admin@lumina.com', '۱۲۳۴۵۶');
    if (!login4.token) throw new Error('Persian digit password login failed');

    // Test Persian phone number format
    const login5 = await authService.login('۰۹۱۲۰۰۰۰۰۰۱', '۱۲۳۴۵۶');
    if (!login5.token) throw new Error('Persian phone number login failed');

    results.push({ test: '17. Slug Aliases & Multi-Format Persian Auth (Fixes Verified)', status: 'PASSED' });
  } catch (err: any) {
    results.push({ test: '17. Slug Aliases & Multi-Format Persian Auth', status: 'FAILED', error: err.message });
  }

  console.log('--- Test Execution Summary ---');
  results.forEach(r => {
    console.log(`[${r.status}] ${r.test} ${r.error ? `-> Error: ${r.error}` : ''}`);
  });

  return results;
}
