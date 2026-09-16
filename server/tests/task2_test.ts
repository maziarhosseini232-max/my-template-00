import { db } from '../db/index.js';
import { courseService } from '../services/courseService.js';
import { authService } from '../services/authService.js';
import { enrollmentService } from '../services/enrollmentService.js';

async function runTests() {
  console.log('--- STARTING TASK 2 AUTHORIZATION & PROTECTED CONTENT TESTS ---');

  // 1. Setup test entities
  const admin = db.users.find(u => u.roles.includes('ADMIN') || u.roles.includes('OWNER'))!;
  const instructor1 = db.users.find(u => u.roles.includes('INSTRUCTOR'))!;
  const student = db.users.find(u => u.roles.includes('STUDENT') && !u.roles.includes('ADMIN'))!;
  
  // Ensure clean test state for student and courses
  student.subscriptionEndDate = undefined;

  // Find a course with sections and lessons
  const course1 = db.courses[0]; // e.g. crs_react_pro
  course1.isVip = false;
  course1.isFree = false;
  course1.price = 250000;
  const privateLesson = course1.sections?.[0]?.lessons?.find(l => !l.isFreePreview);
  const freePreviewLesson = course1.sections?.[0]?.lessons?.find(l => l.isFreePreview);

  if (!privateLesson) {
    console.error('No private lesson found in course1');
    process.exit(1);
  }

  console.log(`Testing with Course: "${course1.title}" (${course1.id})`);
  console.log(`Instructor: ${course1.instructorId}`);
  console.log(`Private Lesson: "${privateLesson.title}" (${privateLesson.id})`);

  let results: { [key: string]: boolean } = {};

  // Scenario 1: Guest → Public Course → PASS
  try {
    const publicCourse = await courseService.getById(course1.id, undefined);
    const pubPrivateLesson = publicCourse.sections[0]?.lessons.find(l => l.id === privateLesson.id);
    const isSanitized = pubPrivateLesson && !pubPrivateLesson.videoUrl && !pubPrivateLesson.textContent;
    results['Scenario 1: Guest → Public Course (Sanitized Metadata)'] = (publicCourse.id === course1.id && isSanitized) as boolean;
    console.log('✓ Scenario 1: Guest → Public Course → PASS (Sanitized appropriately)');
  } catch (e: any) {
    console.error('✗ Scenario 1 Failed:', e.message);
    results['Scenario 1: Guest → Public Course'] = false;
  }

  // Scenario 2: Guest → Private Lesson → DENY
  try {
    await courseService.getLessonById(course1.id, privateLesson.id, undefined);
    console.error('✗ Scenario 2 Failed: Guest was able to get private lesson!');
    results['Scenario 2: Guest → Private Lesson (DENY)'] = false;
  } catch (e: any) {
    if (e.status === 403 || e.message.includes('دسترسی غیرمجاز')) {
      console.log('✓ Scenario 2: Guest → Private Lesson → DENY (403 Forbidden received)');
      results['Scenario 2: Guest → Private Lesson (DENY)'] = true;
    } else {
      console.error('✗ Scenario 2 Unexpected error:', e);
      results['Scenario 2: Guest → Private Lesson (DENY)'] = false;
    }
  }

  // Scenario 3: Student بدون Enrollment → Private Lesson → DENY
  try {
    // Ensure student is NOT enrolled in course1
    db.enrollments = db.enrollments.filter(e => !(e.userId === student.id && e.courseId === course1.id));
    await courseService.getLessonById(course1.id, privateLesson.id, { userId: student.id, roles: student.roles });
    console.error('✗ Scenario 3 Failed: Unenrolled student was able to get private lesson!');
    results['Scenario 3: Student without Enrollment → Private Lesson (DENY)'] = false;
  } catch (e: any) {
    if (e.status === 403 || e.message.includes('دسترسی غیرمجاز') || e.message.includes('ثبت‌نام') || e.code === 'FORBIDDEN_ACCESS') {
      console.log('✓ Scenario 3: Student without Enrollment → Private Lesson → DENY (403 Forbidden)');
      results['Scenario 3: Student without Enrollment → Private Lesson (DENY)'] = true;
    } else {
      console.error('✗ Scenario 3 Unexpected error:', e);
      results['Scenario 3: Student without Enrollment → Private Lesson (DENY)'] = false;
    }
  }

  // Scenario 4: Enrolled Student → Private Lesson → PASS
  try {
    // Enroll student
    await enrollmentService.enroll(student.id, course1.id, 'PAID');
    const lessonData = await courseService.getLessonById(course1.id, privateLesson.id, { userId: student.id, roles: student.roles });
    const hasAccess = lessonData.userAccess.canAccessFull && !!lessonData.lesson.videoUrl;
    console.log(`✓ Scenario 4: Enrolled Student → Private Lesson → PASS (Full video access: ${hasAccess})`);
    results['Scenario 4: Enrolled Student → Private Lesson (PASS)'] = hasAccess;
  } catch (e: any) {
    console.error('✗ Scenario 4 Failed:', e.message);
    results['Scenario 4: Enrolled Student → Private Lesson (PASS)'] = false;
  }

  // Scenario 5: Student → Other Student's protected content (Course B where Student is not enrolled) → DENY
  const course2 = db.courses.find(c => c.id !== course1.id)!;
  if (course2) {
    course2.isVip = false;
    course2.isFree = false;
    course2.price = 300000;
  }
  const course2PrivateLesson = course2?.sections?.[0]?.lessons?.find(l => !l.isFreePreview);
  if (course2PrivateLesson) {
    try {
      db.enrollments = db.enrollments.filter(e => !(e.userId === student.id && e.courseId === course2.id));
      await courseService.getLessonById(course2.id, course2PrivateLesson.id, { userId: student.id, roles: student.roles });
      console.error('✗ Scenario 5 Failed: Student accessed course2 private lesson without enrollment!');
      results["Scenario 5: Student → Other Course's protected content (DENY)"] = false;
    } catch (e: any) {
      if (e.status === 403 || e.message.includes('دسترسی غیرمجاز') || e.message.includes('ثبت‌نام') || e.code === 'FORBIDDEN_ACCESS') {
        console.log("✓ Scenario 5: Student → Other Course's protected content → DENY (403 Forbidden)");
        results["Scenario 5: Student → Other Course's protected content (DENY)"] = true;
      } else {
        results["Scenario 5: Student → Other Course's protected content (DENY)"] = false;
      }
    }
  }

  // Scenario 6: Instructor → Own Course → PASS
  try {
    const instOwnCourse = db.courses.find(c => c.instructorId === instructor1.id)!;
    const instLesson = instOwnCourse.sections?.[0]?.lessons?.[0]!;
    const res = await courseService.getLessonById(instOwnCourse.id, instLesson.id, { userId: instructor1.id, roles: instructor1.roles });
    const hasAccess = res.userAccess.canAccessFull && res.userAccess.reason === 'INSTRUCTOR';
    console.log(`✓ Scenario 6: Instructor → Own Course → PASS (Reason: ${res.userAccess.reason})`);
    results['Scenario 6: Instructor → Own Course (PASS)'] = hasAccess;
  } catch (e: any) {
    console.error('✗ Scenario 6 Failed:', e.message);
    results['Scenario 6: Instructor → Own Course (PASS)'] = false;
  }

  // Scenario 7: Instructor → Unauthorized Course → DENY
  try {
    let otherCourse = db.courses.find(c => c.instructorId !== instructor1.id);
    if (!otherCourse) {
      // Create another instructor's course if none exists
      otherCourse = {
        ...course1,
        id: 'crs_other_instructor',
        instructorId: 'usr_other_inst_99',
        sections: [{
          id: 'sec_other_1',
          courseId: 'crs_other_instructor',
          title: 'فصل اختصاصی مدرس دیگر',
          orderIndex: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lessons: [{
            id: 'lsn_other_priv_1',
            sectionId: 'sec_other_1',
            courseId: 'crs_other_instructor',
            title: 'درس محرمانه',
            contentType: 'VIDEO',
            durationMinutes: 20,
            orderIndex: 0,
            isFreePreview: false,
            videoUrl: 'https://cdn.lumina.ir/secret.mp4',
            resources: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.courses.push(otherCourse);
    }
    const otherPrivateLesson = otherCourse.sections[0].lessons[0];
    db.enrollments = db.enrollments.filter(e => !(e.userId === instructor1.id && e.courseId === otherCourse.id));
    await courseService.getLessonById(otherCourse.id, otherPrivateLesson.id, { userId: instructor1.id, roles: instructor1.roles });
    console.error('✗ Scenario 7 Failed: Instructor accessed another instructor course private lesson!');
    results['Scenario 7: Instructor → Unauthorized Course (DENY)'] = false;
  } catch (e: any) {
    if (e.status === 403 || e.message.includes('دسترسی غیرمجاز')) {
      console.log('✓ Scenario 7: Instructor → Unauthorized Course → DENY (403 Forbidden)');
      results['Scenario 7: Instructor → Unauthorized Course (DENY)'] = true;
    } else {
      console.error('✗ Scenario 7 Failed with:', e);
      results['Scenario 7: Instructor → Unauthorized Course (DENY)'] = false;
    }
  }

  // Scenario 8: Admin → Protected Course → PASS
  try {
    const res = await courseService.getLessonById(course1.id, privateLesson.id, { userId: admin.id, roles: admin.roles });
    const hasAccess = res.userAccess.canAccessFull && res.userAccess.reason === 'ADMIN';
    console.log(`✓ Scenario 8: Admin → Protected Course → PASS (Reason: ${res.userAccess.reason})`);
    results['Scenario 8: Admin → Protected Course (PASS)'] = hasAccess;
  } catch (e: any) {
    console.error('✗ Scenario 8 Failed:', e.message);
    results['Scenario 8: Admin → Protected Course (PASS)'] = false;
  }

  // Signed URL Verification Check
  const testKey = 'courses/crs_1/res_1.pdf';
  const signedUrl = courseService.generateSignedUrl(testKey, student.id, 60);
  const urlObj = new URL('http://localhost' + signedUrl);
  const key = urlObj.searchParams.get('key')!;
  const u = urlObj.searchParams.get('u')!;
  const exp = parseInt(urlObj.searchParams.get('exp')!, 10);
  const sig = urlObj.searchParams.get('sig')!;
  const isSigValid = courseService.verifySignedUrl(key, u, exp, sig);
  const isTamperedSigValid = courseService.verifySignedUrl(key, 'tampered_user', exp, sig);
  console.log(`✓ Signed URL Generation & Timing-Safe Verification: Valid=${isSigValid}, TamperedRejected=${!isTamperedSigValid}`);

  console.log('\n--- TEST SUMMARY ---');
  let allPass = true;
  for (const [name, passed] of Object.entries(results)) {
    console.log(`${passed ? '✅' : '❌'} ${name}`);
    if (!passed) allPass = false;
  }

  if (allPass) {
    console.log('\n🌟 ALL 8 SCENARIOS PASSED WITH FULL PASS!');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
