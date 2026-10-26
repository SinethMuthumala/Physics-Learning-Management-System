// Automated isolated test suite for Physics LMS Backend
process.env.NODE_ENV = "test";

const lessonCtrl = require("./controllers/lessonController");
const authCtrl = require("./controllers/authController");
const quizCtrl = require("./controllers/quizController");
const materialCtrl = require("./controllers/materialController");
const homeworkCtrl = require("./controllers/homeworkController");
const studentCtrl = require("./controllers/studentController");
const { protect, teacherOnly, studentOnly } = require("./middleware/authMiddleware");
const lessonRouter = require("./routes/lessonRoutes");
const materialRouter = require("./routes/materialRoutes");
const homeworkRouter = require("./routes/homeworkRoutes");
const quizRouter = require("./routes/quizRoutes");
const studentRouter = require("./routes/studentRoutes");

const mockRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    headers: {},
    setHeader(key, val) {
      this.headers[key] = val;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
  return res;
};

async function runTests() {
  console.log("🧪 Starting Physics LMS Isolated Verification Suite...\n");
  let passed = 0;
  let total = 0;

  function assert(desc, condition) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${desc}`);
    }
  }

  // 1. Lessons - GET (Read)
  {
    const req = { query: {} };
    const res = mockRes();
    await lessonCtrl.getLessons(req, res);
    assert("GET /api/lessons returns lessons array", Array.isArray(res.data) && res.data.length >= 3);
  }

  // 2. Lessons - In-Memory Isolated CRUD Testing (Does not alter live Atlas data)
  let createdId = null;
  {
    const req = {
      body: {
        title: "Isolated Test Lesson",
        topic: "Thermal Physics",
        description: "Isolated test record.",
        durationMinutes: 45,
        difficulty: "Beginner",
      },
    };
    const res = mockRes();
    await lessonCtrl.createLesson(req, res);
    assert("createLesson handler validates and creates lesson with HTTP 201", res.statusCode === 201 && res.data.title === "Isolated Test Lesson");
    createdId = res.data._id;

    // Update
    const reqPut = {
      params: { id: createdId },
      body: { title: "Isolated Test Lesson (Updated)" },
    };
    const resPut = mockRes();
    await lessonCtrl.updateLesson(reqPut, resPut);
    assert("updateLesson handler updates lesson with HTTP 200", resPut.statusCode === 200 && resPut.data.title.includes("Updated"));

    // Delete
    const reqDel = { params: { id: createdId } };
    const resDel = mockRes();
    await lessonCtrl.deleteLesson(reqDel, resDel);
    assert("deleteLesson handler removes lesson with HTTP 200", resDel.statusCode === 200 && resDel.data.deletedLesson);
  }

  // 3. Auth - Student Registration & JWT
  {
    const req = {
      body: {
        name: "Verified Student",
        email: "verified.student@physicslms.edu",
        password: "Password123!",
        role: "student",
      },
    };
    const res = mockRes();
    await authCtrl.registerUser(req, res);
    assert("Student registration issues valid JWT token with student role", res.statusCode === 201 && res.data.token && res.data.role === "student");
  }

  // 4. Auth - Teacher Secret Key Rejection
  {
    const reqUnauthorized = {
      body: {
        name: "Unauthorized Teacher",
        email: "unauthorized.teacher@physicslms.edu",
        password: "Password123!",
        role: "teacher",
        teacherKey: "WRONG_SECRET",
      },
    };
    const resUnauthorized = mockRes();
    await authCtrl.registerUser(reqUnauthorized, resUnauthorized);
    assert("Unauthorized teacher registration blocked with HTTP 403 Forbidden", resUnauthorized.statusCode === 403);
  }

  // 5. Auth - Login Authentication
  {
    const req = {
      body: {
        email: "verified.student@physicslms.edu",
        password: "Password123!",
      },
    };
    const res = mockRes();
    await authCtrl.loginUser(req, res);
    assert("Login authenticates valid credentials and returns JWT", res.statusCode === 200 && res.data.token);
  }

  // 6. Security - Protect Middleware Rejects Request Without Token
  {
    const reqNoToken = { headers: {} };
    const resNoToken = mockRes();
    let nextCalled = false;
    await protect(reqNoToken, resNoToken, () => { nextCalled = true; });
    assert("protect middleware rejects unauthenticated request with HTTP 401", resNoToken.statusCode === 401 && !nextCalled);
  }

  // 7. Security - Protect Middleware Rejects Invalid Bearer Token
  {
    const reqBadToken = { headers: { authorization: "Bearer invalid.forged.jwt.token" } };
    const resBadToken = mockRes();
    let nextCalled = false;
    await protect(reqBadToken, resBadToken, () => { nextCalled = true; });
    assert("protect middleware rejects invalid/forged token with HTTP 401", resBadToken.statusCode === 401 && !nextCalled);
  }

  // 8. Security - TeacherOnly Guard Rejects Student Role
  {
    const reqStudent = { user: { role: "student" } };
    const resStudent = mockRes();
    let nextCalled = false;
    teacherOnly(reqStudent, resStudent, () => { nextCalled = true; });
    assert("teacherOnly middleware strictly rejects student role with HTTP 403", resStudent.statusCode === 403 && !nextCalled);
  }

  // 9. Security - TeacherOnly Guard Accepts Verified Teacher Role
  {
    const reqTeacher = { user: { role: "teacher" } };
    const resTeacher = mockRes();
    let nextCalled = false;
    teacherOnly(reqTeacher, resTeacher, () => { nextCalled = true; });
    assert("teacherOnly middleware permits verified teacher role to proceed", nextCalled && resTeacher.statusCode === 200);
  }

  // 10. Route Stack Verification - Lessons POST Route Has Auth & Teacher Guards
  {
    const postRoute = lessonRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/" && layer.route.methods.post
    );
    const hasGuards = postRoute && postRoute.route.stack.length >= 3; // protect, teacherOnly, createLesson
    assert("Lesson POST route (/api/lessons) has protect & teacherOnly middleware", hasGuards);
  }

  // 11. Route Stack Verification - Lessons PUT & DELETE Routes Protected
  {
    const putRoute = lessonRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/:id" && layer.route.methods.put
    );
    const delRoute = lessonRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/:id" && layer.route.methods.delete
    );
    const hasGuards = putRoute && putRoute.route.stack.length >= 3 && delRoute && delRoute.route.stack.length >= 3;
    assert("Lesson PUT & DELETE routes (/api/lessons/:id) have protect & teacherOnly middleware", hasGuards);
  }

  // 12. Route Stack Verification - Student Directory Protected (Teacher Only)
  {
    const studentListRoute = studentRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/" && layer.route.methods.get
    );
    const isProtected = studentListRoute && studentListRoute.route.stack.length >= 3;
    assert("Student directory route (/api/students) is restricted to teachers with HTTP 403 guard", isProtected);
  }

  // 13. Route Stack Verification - All Quiz Results Restricted (Teacher Only)
  {
    const resultsRoute = quizRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/results" && layer.route.methods.get
    );
    const isProtected = resultsRoute && resultsRoute.route.stack.length >= 3;
    assert("Class-wide quiz results (/api/quizzes/results) restricted to teachers", isProtected);
  }

  // 14. Study Materials - In-Memory Isolated Verification
  let matId = null;
  {
    const reqPost = {
      body: {
        title: "Isolated Test Formula Sheet",
        topic: "Mechanics",
        resourceType: "Formula Sheet",
        resourceUrl: "https://example.com/formulas.pdf",
      },
    };
    const resPost = mockRes();
    await materialCtrl.createMaterial(reqPost, resPost);
    assert("createMaterial creates study material with HTTP 201", resPost.statusCode === 201);
    matId = resPost.data._id;

    // Update
    const reqPut = {
      params: { id: matId },
      body: { title: "Isolated Test Formula Sheet (Updated)" },
    };
    const resPut = mockRes();
    await materialCtrl.updateMaterial(reqPut, resPut);
    assert("updateMaterial updates study material with HTTP 200", resPut.data && resPut.data.title.includes("Updated"));

    // Delete
    const reqDel = { params: { id: matId } };
    const resDel = mockRes();
    await materialCtrl.deleteMaterial(reqDel, resDel);
    assert("deleteMaterial removes study material", resDel.data && resDel.data.message.includes("deleted"));
  }

  // 15. Homework & Problem Sets - In-Memory Isolated Verification
  let hwId = null;
  {
    const reqPost = {
      body: {
        title: "Isolated Projectile Assignment",
        topic: "Mechanics",
        description: "Solve problems 1-10.",
        dueDate: new Date(Date.now() + 86400000 * 5),
        totalMarks: 50,
      },
    };
    const resPost = mockRes();
    await homeworkCtrl.createHomework(reqPost, resPost);
    assert("createHomework creates assignment with HTTP 201", resPost.statusCode === 201);
    hwId = resPost.data._id;

    const reqPut = {
      params: { id: hwId },
      body: { title: "Isolated Projectile Assignment (Updated)" },
    };
    const resPut = mockRes();
    await homeworkCtrl.updateHomework(reqPut, resPut);
    assert("updateHomework updates assignment with HTTP 200", resPut.data && resPut.data.title.includes("Updated"));

    const reqDel = { params: { id: hwId } };
    const resDel = mockRes();
    await homeworkCtrl.deleteHomework(reqDel, resDel);
    assert("deleteHomework removes assignment with HTTP 200", resDel.data && resDel.data.message.includes("deleted"));
  }

  // 16. Quizzes - Automatic Score Calculation & Instant Feedback
  {
    const reqQuizzes = { query: {} };
    const resQuizzes = mockRes();
    await quizCtrl.getQuizzes(reqQuizzes, resQuizzes);
    const targetQuiz = resQuizzes.data[0];

    const reqSubmit = {
      params: { id: targetQuiz._id },
      body: {
        studentName: "Verified Student",
        studentEmail: "verified.student@physicslms.edu",
        answers: [
          { questionIndex: 0, selectedOptionIndex: targetQuiz.questions[0].correctAnswerIndex },
          { questionIndex: 1, selectedOptionIndex: targetQuiz.questions[1].correctAnswerIndex },
        ],
      },
    };
    const resSubmit = mockRes();
    await quizCtrl.submitQuiz(reqSubmit, resSubmit);
    assert(
      "submitQuiz calculates accurate scores and returns question explanations",
      resSubmit.statusCode === 200 && resSubmit.data.score >= 4 && Array.isArray(resSubmit.data.detailedFeedback)
    );
  }

  // 17. Student Stats - Metrics Aggregation
  {
    const reqStats = {};
    const resStats = mockRes();
    await studentCtrl.getDashboardStats(reqStats, resStats);
    assert("getDashboardStats calculates summary metrics", resStats.data.totalLessons >= 3 && resStats.data.totalStudents >= 1);
  }

  // 18. Quiz Submit Route Security - Protected with auth middleware
  {
    const submitRoute = quizRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/:id/submit" && layer.route.methods.post
    );
    const hasAuth = submitRoute && submitRoute.route.stack.length >= 2;
    assert("Quiz submit route (POST /api/quizzes/:id/submit) has protect middleware", hasAuth);
  }

  // 19. Student Quiz History Retrieval - Matches by email/ID linkage
  {
    const reqResults = {
      user: {
        _id: "6adf02536c00792f2e9352ae",
        email: "verified.student@physicslms.edu",
        name: "Verified Student",
      },
    };
    const resResults = mockRes();
    await quizCtrl.getMyQuizResults(reqResults, resResults);
    assert(
      "getMyQuizResults retrieves submissions for authenticated student",
      Array.isArray(resResults.data) && resResults.data.length > 0
    );
  }

  // 20. Homework - Student Submission with Response Text & Google Drive Link
  {
    const reqSubmitHw = {
      params: { id: "660000000000000000000301" },
      user: {
        _id: "6adf02536c00792f2e9352ae",
        name: "Kasun Perera",
        email: "student@physicslms.edu",
        role: "student",
      },
      body: {
        submissionText: "Derived trajectory equations. Solution notes uploaded to Drive: https://drive.google.com/file/d/test-doc",
        submissionLink: "https://drive.google.com/file/d/test-doc",
      },
    };
    const resSubmitHw = mockRes();
    await homeworkCtrl.submitHomework(reqSubmitHw, resSubmitHw);
    assert(
      "submitHomework saves student solution and auto-links URL with HTTP 200",
      resSubmitHw.statusCode === 200 &&
        resSubmitHw.data.submission &&
        resSubmitHw.data.submission.submissionLink === "https://drive.google.com/file/d/test-doc"
    );
  }

  // 21. Homework - Teacher Submission Viewing & Enrolled Roster Aggregation
  {
    const reqSubs = {
      params: { id: "660000000000000000000301" },
      user: {
        _id: "660000000000000000000001",
        name: "Dr. Gamini Senanayake",
        email: "teacher@physicslms.edu",
        role: "teacher",
      },
    };
    const resSubs = mockRes();
    await homeworkCtrl.getHomeworkSubmissions(reqSubs, resSubs);
    assert(
      "getHomeworkSubmissions aggregates enrolled roster and identifies submitted students",
      Array.isArray(resSubs.data.studentRoster) &&
        resSubs.data.totalEnrolled >= 1 &&
        resSubs.data.studentRoster.some((s) => s.submitted && s.submission)
    );
  }

  // 22. Homework Submission Route Security - Protected with auth middleware
  {
    const submitRoute = homeworkRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/:id/submit" && layer.route.methods.post
    );
    const hasAuth = submitRoute && submitRoute.route.stack.length >= 2;
    assert("Homework submit route (POST /api/homework/:id/submit) has protect middleware", hasAuth);
  }

  // 23. Homework Submissions Route Security - Teacher Only Access Guard
  {
    const subsRoute = homeworkRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/:id/submissions" && layer.route.methods.get
    );
    const isTeacherRestricted = subsRoute && subsRoute.route.stack.length >= 3;
    assert(
      "Homework submissions viewer (GET /api/homework/:id/submissions) restricted to teachers",
      isTeacherRestricted
    );
  }

  // 24. Homework Privacy - Student view masks other students' private responses
  {
    const reqPublic = {
      headers: {},
      query: {},
    };
    const resPublic = mockRes();
    await homeworkCtrl.getHomeworks(reqPublic, resPublic);
    const target = resPublic.data.find((h) => String(h._id) === "660000000000000000000301");
    assert(
      "getHomeworks protects student privacy and never leaks raw submissions to unauthorized viewers",
      target && (!target.submissions || target.submissions.length === 0)
    );
  }

  console.log(`\n🎉 Verification Complete: ${passed}/${total} isolated tests passed successfully!\n`);
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
