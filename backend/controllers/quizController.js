const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizResult = require("../models/QuizResult");
const User = require("../models/User");

const initialQuizzesSeed = [
  {
    _id: "660000000000000000000401",
    title: "Mechanics & Kinematics Mastery Quiz",
    topic: "Mechanics",
    timeLimitMinutes: 10,
    passingScore: 60,
    status: "Published",
    questions: [
      {
        questionText: "A stone is thrown vertically upward with velocity 20 m/s. Taking g = 10 m/s², what is the maximum height reached?",
        options: ["10 m", "20 m", "40 m", "200 m"],
        correctAnswerIndex: 1,
        explanation: "Using v² = u² - 2gh: At top, v = 0 => 0 = (20)² - 2(10)h => 20h = 400 => h = 20 m.",
        marks: 2,
      },
      {
        questionText: "Which of the following physical quantities is conserved in both elastic and inelastic collisions?",
        options: ["Kinetic energy only", "Linear momentum only", "Both kinetic energy and linear momentum", "Neither"],
        correctAnswerIndex: 1,
        explanation: "Linear momentum is conserved in all collisions where net external force is zero. Kinetic energy is only conserved in elastic collisions.",
        marks: 2,
      },
      {
        questionText: "What is the SI unit of angular momentum?",
        options: ["kg·m/s", "kg·m²/s", "N·s", "J·s²"],
        correctAnswerIndex: 1,
        explanation: "Angular momentum L = r x p = [m] * [kg m/s] = kg·m²/s (or J·s).",
        marks: 2,
      },
      {
        questionText: "When an object moves in a uniform circular motion with constant speed, its acceleration is:",
        options: [
          "Zero",
          "Constant in direction and magnitude",
          "Directed tangentially to the circle",
          "Directed towards the center with magnitude v²/r",
        ],
        correctAnswerIndex: 3,
        explanation: "Centripetal acceleration always points radially towards the center of curvature with magnitude a = v²/r.",
        marks: 2,
      },
      {
        questionText: "Work done by a conservative force along a closed path is always:",
        options: ["Positive", "Negative", "Zero", "Dependent on the path taken"],
        correctAnswerIndex: 2,
        explanation: "By definition, the line integral of a conservative force around any closed loop is zero.",
        marks: 2,
      },
    ],
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000402",
    title: "Electricity & Circuits Quick Assessment",
    topic: "Electricity & Magnetism",
    timeLimitMinutes: 10,
    passingScore: 60,
    status: "Published",
    questions: [
      {
        questionText: "Two resistors of 6 ohms and 3 ohms are connected in parallel. What is their equivalent resistance?",
        options: ["9 ohms", "3 ohms", "2 ohms", "1.5 ohms"],
        correctAnswerIndex: 2,
        explanation: "1/R_eq = 1/6 + 1/3 = 3/6 => R_eq = 2 ohms.",
        marks: 2,
      },
      {
        questionText: "Kirchhoff's First Rule (Junction Rule) is a direct consequence of the conservation of:",
        options: ["Energy", "Electric Charge", "Momentum", "Potential"],
        correctAnswerIndex: 1,
        explanation: "Total current entering a junction equals total current leaving, representing conservation of electric charge.",
        marks: 2,
      },
      {
        questionText: "The energy stored in a capacitor of capacitance C charged to potential V is given by:",
        options: ["(1/2) C V²", "C V²", "(1/2) C² V", "C / V²"],
        correctAnswerIndex: 0,
        explanation: "Electrostatic potential energy stored is U = (1/2)CV² = (1/2)QV = Q²/(2C).",
        marks: 2,
      },
    ],
    createdAt: new Date(),
  },
];

let memoryQuizzes = JSON.parse(JSON.stringify(initialQuizzesSeed));
let memoryResults = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public
const getQuizzes = async (req, res) => {
  try {
    const { topic } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (topic && topic !== "All") query.topic = topic;

      let quizzes = await Quiz.find(query).sort({ createdAt: -1 });
      if (quizzes.length === 0 && !topic) {
        const count = await Quiz.countDocuments();
        if (count === 0) {
          quizzes = await Quiz.insertMany(initialQuizzesSeed.map(({ _id, ...r }) => r));
          console.log("🌱 Auto-seeded initial Physics Quizzes into MongoDB");
        }
      }
      return res.json(quizzes);
    }

    // Memory fallback
    let filtered = [...memoryQuizzes];
    if (topic && topic !== "All") {
      filtered = filtered.filter((q) => q.topic === topic);
    }
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ message: "Server error fetching quizzes" });
  }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Public
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const quiz = await Quiz.findById(id);
      if (quiz) return res.json(quiz);
    }

    const found = memoryQuizzes.find((q) => String(q._id) === String(id));
    if (!found) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(found);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching quiz" });
  }
};

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Teacher
const createQuiz = async (req, res) => {
  try {
    const { title, topic, timeLimitMinutes, passingScore, questions, status } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Title and at least one question are required" });
    }

    const quizData = {
      title: title.trim(),
      topic: topic || "General Physics",
      timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : 15,
      passingScore: passingScore ? Number(passingScore) : 50,
      questions,
      status: status || "Published",
    };

    if (isDbConnected()) {
      const quiz = await Quiz.create(quizData);
      memoryQuizzes.unshift(quiz.toObject());
      return res.status(201).json(quiz);
    }

    const memoryItem = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...quizData,
      createdAt: new Date(),
    };
    memoryQuizzes.unshift(memoryItem);
    res.status(201).json(memoryItem);
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: error.message || "Server error creating quiz" });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Teacher
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, topic, timeLimitMinutes, passingScore, questions, status } = req.body;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Quiz.findByIdAndUpdate(
        id,
        {
          ...(title && { title: title.trim() }),
          ...(topic && { topic }),
          ...(timeLimitMinutes && { timeLimitMinutes: Number(timeLimitMinutes) }),
          ...(passingScore && { passingScore: Number(passingScore) }),
          ...(questions && { questions }),
          ...(status && { status }),
        },
        { new: true }
      );
      if (updated) return res.json(updated);
    }

    const idx = memoryQuizzes.findIndex((q) => String(q._id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (title) memoryQuizzes[idx].title = title.trim();
    if (topic) memoryQuizzes[idx].topic = topic;
    if (timeLimitMinutes) memoryQuizzes[idx].timeLimitMinutes = Number(timeLimitMinutes);
    if (passingScore) memoryQuizzes[idx].passingScore = Number(passingScore);
    if (questions) memoryQuizzes[idx].questions = questions;
    if (status) memoryQuizzes[idx].status = status;

    res.json(memoryQuizzes[idx]);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error updating quiz" });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Teacher
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      await Quiz.findByIdAndDelete(id);
    }

    memoryQuizzes = memoryQuizzes.filter((q) => String(q._id) !== String(id));
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting quiz" });
  }
};

// @desc    Submit quiz answers and calculate real score
// @route   POST /api/quizzes/:id/submit
// @access  Public / Student
const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    let quiz = null;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      quiz = await Quiz.findById(id);
    }
    if (!quiz) {
      quiz = memoryQuizzes.find((q) => String(q._id) === String(id));
    }

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers array is required" });
    }

    let calculatedScore = 0;
    let totalMarks = 0;
    const evaluatedAnswers = [];

    quiz.questions.forEach((q, idx) => {
      const qMarks = q.marks || 1;
      totalMarks += qMarks;

      const studentAns = answers.find((a) => a.questionIndex === idx);
      const selectedIndex = studentAns !== undefined ? studentAns.selectedOptionIndex : -1;
      const isCorrect = selectedIndex === q.correctAnswerIndex;

      if (isCorrect) {
        calculatedScore += qMarks;
      }

      evaluatedAnswers.push({
        questionIndex: idx,
        questionText: q.questionText,
        options: q.options,
        selectedOptionIndex: selectedIndex,
        correctAnswerIndex: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation,
        marksEarned: isCorrect ? qMarks : 0,
      });
    });

    const percentage = totalMarks > 0 ? Math.round((calculatedScore / totalMarks) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 50);

    let studentUser = req.user;
    if (!studentUser) {
      const email = req.body.studentEmail || "student@physicslms.edu";
      if (isDbConnected()) {
        try {
          const found = await User.findOne({ email }).select("-password");
          if (found) {
            studentUser = found;
          }
        } catch (err) {
          console.error("Error looking up student user:", err.message);
        }
      }
    }
    if (!studentUser) {
      studentUser = {
        _id: "660000000000000000000002",
        name: req.body.studentName || "Kasun Perera (Student)",
        email: req.body.studentEmail || "student@physicslms.edu",
      };
    }

    const resultData = {
      quizId: quiz._id,
      quizTitle: quiz.title,
      studentId: studentUser._id,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      score: calculatedScore,
      totalMarks,
      percentage,
      passed,
      answers: evaluatedAnswers.map((ea) => ({
        questionIndex: ea.questionIndex,
        selectedOptionIndex: ea.selectedOptionIndex,
        isCorrect: ea.isCorrect,
      })),
      completedAt: new Date(),
    };

    if (isDbConnected()) {
      const savedResult = await QuizResult.create(resultData);
      memoryResults.unshift(savedResult.toObject());
      return res.status(200).json({
        message: passed ? "Congratulations! You passed the quiz." : "Quiz completed. Keep practicing!",
        resultId: savedResult._id,
        score: calculatedScore,
        totalMarks,
        percentage,
        passed,
        passingScore: quiz.passingScore,
        detailedFeedback: evaluatedAnswers,
      });
    }

    const memoryItem = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...resultData,
    };
    memoryResults.unshift(memoryItem);

    res.status(200).json({
      message: passed ? "Congratulations! You passed the quiz." : "Quiz completed. Keep practicing!",
      resultId: memoryItem._id,
      score: calculatedScore,
      totalMarks,
      percentage,
      passed,
      passingScore: quiz.passingScore,
      detailedFeedback: evaluatedAnswers,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ message: error.message || "Server error submitting quiz" });
  }
};

// @desc    Get all quiz results (Teacher)
// @route   GET /api/quizzes/results
// @access  Public / Teacher
const getAllQuizResults = async (req, res) => {
  try {
    if (isDbConnected()) {
      const results = await QuizResult.find().sort({ completedAt: -1 });
      return res.json(results);
    }
    res.json(memoryResults);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching results" });
  }
};

// @desc    Get current user's quiz results
// @route   GET /api/quizzes/my-results
// @access  Public / Protected
const getMyQuizResults = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : "660000000000000000000002";
    const userEmail = req.user ? req.user.email : "student@physicslms.edu";

    if (isDbConnected()) {
      const orClauses = [];
      if (userId) {
        orClauses.push({ studentId: userId });
        orClauses.push({ studentId: String(userId) });
      }
      if (userEmail) {
        orClauses.push({ studentEmail: userEmail });
      }

      const query = orClauses.length > 0 ? { $or: orClauses } : {};
      const results = await QuizResult.find(query).sort({ completedAt: -1 });
      return res.json(results);
    }

    const filtered = memoryResults.filter(
      (r) =>
        (userId && (String(r.studentId) === String(userId))) ||
        (userEmail && r.studentEmail === userEmail)
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching my results" });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getAllQuizResults,
  getMyQuizResults,
};
