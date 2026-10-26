const express = require("express");
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getAllQuizResults,
  getMyQuizResults,
} = require("../controllers/quizController");
const { protect, teacherOnly } = require("../middleware/authMiddleware");

router.route("/")
  .get(getQuizzes)
  .post(protect, teacherOnly, createQuiz);

// Teacher-only endpoint to view class-wide results
router.get("/results", protect, teacherOnly, getAllQuizResults);

// Student endpoint to view personal past results
router.get("/my-results", protect, getMyQuizResults);

router.route("/:id")
  .get(getQuizById)
  .put(protect, teacherOnly, updateQuiz)
  .delete(protect, teacherOnly, deleteQuiz);

router.post("/:id/submit", protect, submitQuiz);

module.exports = router;
