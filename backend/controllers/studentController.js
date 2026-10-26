const mongoose = require("mongoose");
const User = require("../models/User");
const Lesson = require("../models/Lesson");
const StudyMaterial = require("../models/StudyMaterial");
const Homework = require("../models/Homework");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");

const demoStudentsSeed = [
  {
    _id: "660000000000000000000002",
    name: "Kasun Perera",
    email: "student@physicslms.edu",
    role: "student",
    batch: "A/L Physics 2026",
    phone: "+94 77 123 4567",
    quizzesTaken: 2,
    averageQuizScore: 85,
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000003",
    name: "Dinithi Jayawardena",
    email: "dinithi.j@physicslms.edu",
    role: "student",
    batch: "A/L Physics 2026",
    phone: "+94 71 987 6543",
    quizzesTaken: 1,
    averageQuizScore: 90,
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000004",
    name: "Malik Fernando",
    email: "malik.f@physicslms.edu",
    role: "student",
    batch: "A/L Physics 2026",
    phone: "+94 76 555 4321",
    quizzesTaken: 3,
    averageQuizScore: 78,
    createdAt: new Date(),
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all students (Teacher only)
// @route   GET /api/students
// @access  Teacher
const getAllStudents = async (req, res) => {
  try {
    if (isDbConnected()) {
      let students = await User.find({ role: "student" })
        .select("-password")
        .sort({ createdAt: -1 });

      if (students.length === 0) {
        for (const s of demoStudentsSeed) {
          const { _id, quizzesTaken, averageQuizScore, ...userData } = s;
          await User.create({ ...userData, password: "Password123!" });
        }
        students = await User.find({ role: "student" }).select("-password");
      }

      const studentStats = await Promise.all(
        students.map(async (student) => {
          const results = await QuizResult.find({
            $or: [
              { studentId: student._id },
              { studentId: String(student._id) },
              { studentEmail: student.email },
            ],
          });
          const quizzesTaken = results.length;
          const avgScore =
            quizzesTaken > 0
              ? Math.round(
                  results.reduce((acc, r) => acc + r.percentage, 0) / quizzesTaken
                )
              : 0;

          return {
            ...student.toObject(),
            quizzesTaken,
            averageQuizScore: avgScore,
          };
        })
      );

      return res.json(studentStats);
    }

    // Memory fallback
    res.json(demoStudentsSeed);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error fetching students" });
  }
};

// @desc    Get high-level dashboard metrics (Teacher & Admin)
// @route   GET /api/students/stats
// @access  Teacher / Protected
const getDashboardStats = async (req, res) => {
  try {
    if (isDbConnected()) {
      const [
        totalLessons,
        totalStudents,
        totalMaterials,
        totalHomework,
        totalQuizzes,
        allResults,
      ] = await Promise.all([
        Lesson.countDocuments(),
        User.countDocuments({ role: "student" }),
        StudyMaterial.countDocuments(),
        Homework.countDocuments(),
        Quiz.countDocuments(),
        QuizResult.find(),
      ]);

      const totalSubmissions = allResults.length;
      const avgScore =
        totalSubmissions > 0
          ? Math.round(
              allResults.reduce((acc, r) => acc + r.percentage, 0) / totalSubmissions
            )
          : 82;

      return res.json({
        totalLessons,
        totalStudents: totalStudents || demoStudentsSeed.length,
        totalMaterials,
        totalHomework,
        totalQuizzes,
        totalSubmissions,
        averageScore: avgScore,
      });
    }

    // In-memory fallback stats
    res.json({
      totalLessons: 3,
      totalStudents: demoStudentsSeed.length,
      totalMaterials: 4,
      totalHomework: 3,
      totalQuizzes: 2,
      totalSubmissions: 6,
      averageScore: 84,
    });
  } catch (error) {
    console.error("Error calculating dashboard stats:", error);
    res.status(500).json({ message: "Server error calculating stats" });
  }
};

module.exports = { getAllStudents, getDashboardStats };
