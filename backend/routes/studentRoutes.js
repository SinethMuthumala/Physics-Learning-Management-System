const express = require("express");
const router = express.Router();
const { getAllStudents, getDashboardStats } = require("../controllers/studentController");
const { protect, teacherOnly } = require("../middleware/authMiddleware");

// Teacher-only endpoint for student directory
router.get("/", protect, teacherOnly, getAllStudents);

// Public / Protected aggregate metrics overview
router.get("/stats", getDashboardStats);

module.exports = router;
