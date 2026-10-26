const express = require("express");
const router = express.Router();
const {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");
const { protect, teacherOnly } = require("../middleware/authMiddleware");

// RESTful CRUD routes for Physics Lessons
router.route("/")
  .get(getLessons)
  .post(protect, teacherOnly, createLesson);

router.route("/:id")
  .get(getLessonById)
  .put(protect, teacherOnly, updateLesson)
  .delete(protect, teacherOnly, deleteLesson);

module.exports = router;
