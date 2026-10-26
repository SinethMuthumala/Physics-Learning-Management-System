const express = require("express");
const router = express.Router();
const {
  getHomeworks,
  getHomeworkById,
  createHomework,
  updateHomework,
  deleteHomework,
  submitHomework,
  getHomeworkSubmissions,
  getMySubmissions,
} = require("../controllers/homeworkController");
const { protect, teacherOnly } = require("../middleware/authMiddleware");

router.route("/")
  .get(getHomeworks)
  .post(protect, teacherOnly, createHomework);

// Student personal submissions history
router.get("/my-submissions", protect, getMySubmissions);

// Teacher view submissions for a specific homework assignment
router.get("/:id/submissions", protect, teacherOnly, getHomeworkSubmissions);

// Student submit assignment response
router.post("/:id/submit", protect, submitHomework);

router.route("/:id")
  .get(getHomeworkById)
  .put(protect, teacherOnly, updateHomework)
  .delete(protect, teacherOnly, deleteHomework);

module.exports = router;
