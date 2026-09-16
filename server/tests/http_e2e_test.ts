async function testHttpEndpoints() {
  const baseUrl = 'http://localhost:3000/api';
  console.log('\n--- TESTING LIVE HTTP API ACCESS CONTROL & IDOR PROTECTION ---');

  // 1. Admin login
  const adminRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone: 'maziarhosseini232@gmail.com', password: '123456' })
  });
  const adminData = await adminRes.json();
  const adminToken = adminData.data?.token;

  // 2. Register fresh student (NOT enrolled in crs_figma_ui)
  const freshEmail = `test_student_${Date.now()}@example.com`;
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'دانشجوی جدید آزمایشی', email: freshEmail, password: 'password123' })
  });
  const regData = await regRes.json();
  const studentToken = regData.data?.token;
  const studentUser = regData.data?.user;

  // 3. Public get course (Guest)
  const guestCourseRes = await fetch(`${baseUrl}/courses/crs_react_pro`);
  const guestCourseData = await guestCourseRes.json();
  const guestLesson = guestCourseData.data?.sections?.[0]?.lessons?.[1];
  console.log(`[HTTP Guest Course] Sanitized videoUrl is undefined: ${guestLesson?.videoUrl === undefined}`);
  console.log(`[HTTP Guest Course] userAccess: ${JSON.stringify(guestCourseData.data?.userAccess)}`);

  // 4. Guest tries to fetch private lesson
  const guestLessonRes = await fetch(`${baseUrl}/courses/crs_react_pro/lessons/lsn_1_2`);
  console.log(`[HTTP Guest Private Lesson] Status: ${guestLessonRes.status} (Expected: 403)`);

  // 5. Fresh Student (before enrollment) tries to fetch private lesson
  const studentUnenrolledLessonRes = await fetch(`${baseUrl}/courses/crs_react_pro/lessons/lsn_1_2`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log(`[HTTP Unenrolled Student Private Lesson] Status: ${studentUnenrolledLessonRes.status} (Expected: 403)`);

  // 6. Student enrolls in course
  const enrollRes = await fetch(`${baseUrl}/enrollments/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ courseId: 'crs_react_pro' })
  });
  console.log(`[HTTP Enrollment Action] Status: ${enrollRes.status} (Expected: 201)`);

  // 7. Enrolled Student fetches private lesson
  const studentEnrolledLessonRes = await fetch(`${baseUrl}/courses/crs_react_pro/lessons/lsn_1_2`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const studentEnrolledData = await studentEnrolledLessonRes.json();
  console.log(`[HTTP Enrolled Student Private Lesson] Status: ${studentEnrolledLessonRes.status}, Video Available: ${!!studentEnrolledData.data?.lesson?.videoUrl}`);

  // 8. Student tries to access ANOTHER course private lesson where not enrolled (crs_figma_ui)
  const studentOtherCourseLessonRes = await fetch(`${baseUrl}/courses/crs_figma_ui/lessons/lsn_figma_1`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log(`[HTTP IDOR / Other Course Private Lesson] Status: ${studentOtherCourseLessonRes.status} (Expected: 403)`);

  // 9. Admin fetches private lesson
  const adminLessonRes = await fetch(`${baseUrl}/courses/crs_react_pro/lessons/lsn_1_2`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminLessonData = await adminLessonRes.json();
  console.log(`[HTTP Admin Private Lesson] Status: ${adminLessonRes.status}, Video Available: ${!!adminLessonData.data?.lesson?.videoUrl}`);

  console.log('--- HTTP API TESTS COMPLETE ---\n');
}

testHttpEndpoints().catch(err => {
  console.error(err);
  process.exit(1);
});
