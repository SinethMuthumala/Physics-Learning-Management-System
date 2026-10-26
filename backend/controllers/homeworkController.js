const mongoose = require("mongoose");
const Homework = require("../models/Homework");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../middleware/authMiddleware");

const initialHomeworkSeed = [
  {
    _id: "660000000000000000000301",
    title: "Kinematics & Projectile Motion Assignment 01",
    topic: "Mechanics",
    description:
      "Solve problems 1 to 15 from Chapter 3. Calculate projectile range, maximum height, and velocity vector at impact for launch angles 30°, 45°, and 60°.",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    totalMarks: 50,
    submissionType: "Handwritten / In-Class",
    resourceAttachment: "https://example.com/homework/kinematics-01.pdf",
    submissions: [],
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000302",
    title: "Kirchhoff's Laws & Capacitor Discharge Problem Set",
    topic: "Electricity & Magnetism",
    description:
      "Analyze the 3-loop bridge circuit attached. Derive loop equations, calculate current across resistor R3, and find time constant tau for the RC discharging cycle.",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalMarks: 40,
    submissionType: "Online Submission",
    resourceAttachment: "https://example.com/homework/circuits-02.pdf",
    submissions: [],
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000303",
    title: "Standing Waves & Resonance Tube Lab Report",
    topic: "Waves & Optics",
    description:
      "Complete laboratory calculations for the speed of sound using 512 Hz and 480 Hz tuning forks with end-correction considerations.",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    totalMarks: 30,
    submissionType: "Worksheet",
    resourceAttachment: "https://example.com/homework/sound-resonance.pdf",
    submissions: [],
    createdAt: new Date(),
  },
];

let memoryHomeworks = JSON.parse(JSON.stringify(initialHomeworkSeed));
const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to decode user without throwing when optional
const getOptionalUser = (req) => {
  if (req.user) return req.user;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, getJwtSecret());
      return decoded;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// @desc    Get all homework assignments
// @route   GET /api/homework
// @access  Public / Authenticated
const getHomeworks = async (req, res) => {
  try {
    const { topic, search } = req.query;
    const currentUser = getOptionalUser(req);
    const isTeacher = currentUser?.role === "teacher";
    const currentUserId = currentUser?.id || currentUser?._id;
    const currentUserEmail = currentUser?.email;

    let homeworksList = [];

    if (isDbConnected()) {
      let query = {};
      if (topic && topic !== "All") query.topic = topic;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      homeworksList = await Homework.find(query).sort({ dueDate: 1 });
      if (homeworksList.length === 0 && !topic && !search) {
        const count = await Homework.countDocuments();
        if (count === 0) {
          homeworksList = await Homework.insertMany(
            initialHomeworkSeed.map(({ _id, ...r }) => r)
          );
          console.log("🌱 Auto-seeded initial Homework items into MongoDB");
        }
      }
    } else {
      // Memory fallback
      let filtered = [...memoryHomeworks];
      if (topic && topic !== "All") {
        filtered = filtered.filter((h) => h.topic === topic);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (h) =>
            h.title.toLowerCase().includes(q) ||
            (h.description && h.description.toLowerCase().includes(q))
        );
      }
      homeworksList = filtered;
    }

    // Format and sanitize for privacy:
    // Teachers get full submissionsCount.
    // Students only get their own submission details, never other students' private answers!
    const sanitized = homeworksList.map((h) => {
      const hwObj = typeof h.toObject === "function" ? h.toObject() : { ...h };
      const allSubs = hwObj.submissions || [];
      const submissionsCount = allSubs.length;

      if (isTeacher) {
        return {
          ...hwObj,
          submissionsCount,
        };
      }

      // Check if current student submitted
      const mySub = allSubs.find(
        (s) =>
          (currentUserId && String(s.studentId) === String(currentUserId)) ||
          (currentUserEmail && s.studentEmail === currentUserEmail)
      );

      return {
        ...hwObj,
        submissionsCount,
        submissions: mySub ? [mySub] : [],
        isSubmitted: !!mySub,
        mySubmission: mySub || null,
      };
    });

    res.json(sanitized);
  } catch (error) {
    console.error("Error fetching homework:", error);
    res.status(500).json({ message: "Server error fetching homework" });
  }
};

// @desc    Get single homework
// @route   GET /api/homework/:id
// @access  Public
const getHomeworkById = async (req, res) => {
  try {
    const { id } = req.params;
    let found = null;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      found = await Homework.findById(id);
    }
    if (!found) {
      found = memoryHomeworks.find((h) => String(h._id) === String(id));
    }

    if (!found) {
      return res.status(404).json({ message: "Homework not found" });
    }

    const currentUser = getOptionalUser(req);
    const isTeacher = currentUser?.role === "teacher";
    const currentUserId = currentUser?.id || currentUser?._id;
    const currentUserEmail = currentUser?.email;

    const hwObj = typeof found.toObject === "function" ? found.toObject() : { ...found };
    const allSubs = hwObj.submissions || [];
    const submissionsCount = allSubs.length;

    if (isTeacher) {
      return res.json({
        ...hwObj,
        submissionsCount,
      });
    }

    const mySub = allSubs.find(
      (s) =>
        (currentUserId && String(s.studentId) === String(currentUserId)) ||
        (currentUserEmail && s.studentEmail === currentUserEmail)
    );

    res.json({
      ...hwObj,
      submissionsCount,
      submissions: mySub ? [mySub] : [],
      isSubmitted: !!mySub,
      mySubmission: mySub || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching homework" });
  }
};

// @desc    Create homework
// @route   POST /api/homework
// @access  Teacher
const createHomework = async (req, res) => {
  try {
    const {
      title,
      topic,
      description,
      dueDate,
      totalMarks,
      submissionType,
      resourceAttachment,
    } = req.body;

    if (!title || !description || !dueDate) {
      return res
        .status(400)
        .json({ message: "Title, description, and due date are required" });
    }

    const homeworkData = {
      title: title.trim(),
      topic: topic || "General Physics",
      description: description.trim(),
      dueDate: new Date(dueDate),
      totalMarks: totalMarks ? Number(totalMarks) : 100,
      submissionType: submissionType || "Handwritten / In-Class",
      resourceAttachment: resourceAttachment ? resourceAttachment.trim() : "",
      submissions: [],
    };

    if (isDbConnected()) {
      const homework = await Homework.create(homeworkData);
      memoryHomeworks.push(homework.toObject());
      return res.status(201).json(homework);
    }

    const memoryItem = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...homeworkData,
      createdAt: new Date(),
    };
    memoryHomeworks.push(memoryItem);
    res.status(201).json(memoryItem);
  } catch (error) {
    console.error("Error creating homework:", error);
    res.status(500).json({ message: error.message || "Server error creating homework" });
  }
};

// @desc    Update homework
// @route   PUT /api/homework/:id
// @access  Teacher
const updateHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      topic,
      description,
      dueDate,
      totalMarks,
      submissionType,
      resourceAttachment,
    } = req.body;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await Homework.findByIdAndUpdate(
        id,
        {
          ...(title && { title: title.trim() }),
          ...(topic && { topic }),
          ...(description && { description: description.trim() }),
          ...(dueDate && { dueDate: new Date(dueDate) }),
          ...(totalMarks && { totalMarks: Number(totalMarks) }),
          ...(submissionType && { submissionType }),
          ...(resourceAttachment !== undefined && {
            resourceAttachment: resourceAttachment.trim(),
          }),
        },
        { new: true }
      );
      if (updated) return res.json(updated);
    }

    const idx = memoryHomeworks.findIndex((h) => String(h._id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ message: "Homework not found" });
    }

    if (title) memoryHomeworks[idx].title = title.trim();
    if (topic) memoryHomeworks[idx].topic = topic;
    if (description) memoryHomeworks[idx].description = description.trim();
    if (dueDate) memoryHomeworks[idx].dueDate = new Date(dueDate);
    if (totalMarks) memoryHomeworks[idx].totalMarks = Number(totalMarks);
    if (submissionType) memoryHomeworks[idx].submissionType = submissionType;
    if (resourceAttachment !== undefined)
      memoryHomeworks[idx].resourceAttachment = resourceAttachment.trim();

    res.json(memoryHomeworks[idx]);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error updating homework" });
  }
};

// @desc    Delete homework
// @route   DELETE /api/homework/:id
// @access  Teacher
const deleteHomework = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      await Homework.findByIdAndDelete(id);
    }

    memoryHomeworks = memoryHomeworks.filter((h) => String(h._id) !== String(id));
    res.json({ message: "Homework deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting homework" });
  }
};

// @desc    Submit student solution for an assignment
// @route   POST /api/homework/:id/submit
// @access  Student / Authenticated
const submitHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionText, submissionLink } = req.body;

    if (!submissionText || !submissionText.trim()) {
      return res
        .status(400)
        .json({ message: "Solution text or link is required for submission" });
    }

    // 1. Resolve student identity
    let studentUser = req.user;
    if (!studentUser) {
      const email = req.body.studentEmail || "student@physicslms.edu";
      if (isDbConnected()) {
        try {
          studentUser = await User.findOne({ email }).select("-password");
        } catch (e) {}
      }
    }
    if (!studentUser) {
      studentUser = {
        _id: new mongoose.Types.ObjectId("660000000000000000000002"),
        name: req.body.studentName || "Kasun Perera",
        email: req.body.studentEmail || "student@physicslms.edu",
      };
    }

    const cleanText = submissionText.trim();
    // Auto-detect link if not provided separately
    let cleanLink = submissionLink ? submissionLink.trim() : "";
    if (!cleanLink) {
      const urlMatch = cleanText.match(/https?:\/\/[^\s]+/);
      if (urlMatch) cleanLink = urlMatch[0];
    }

    const submissionData = {
      studentId: studentUser._id,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      submissionText: cleanText,
      submissionLink: cleanLink,
      status: "Submitted",
      submittedAt: new Date(),
    };

    // 2. Persist in MongoDB Atlas if connected
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const homework = await Homework.findById(id);
      if (!homework) {
        return res.status(404).json({ message: "Homework assignment not found" });
      }

      if (!homework.submissions) {
        homework.submissions = [];
      }

      const existingIndex = homework.submissions.findIndex(
        (s) =>
          String(s.studentId) === String(studentUser._id) ||
          s.studentEmail === studentUser.email
      );

      if (existingIndex !== -1) {
        homework.submissions[existingIndex].submissionText = cleanText;
        homework.submissions[existingIndex].submissionLink = cleanLink;
        homework.submissions[existingIndex].status = "Submitted";
        homework.submissions[existingIndex].submittedAt = new Date();
      } else {
        homework.submissions.push(submissionData);
      }

      await homework.save();

      // Keep memory mirror in sync
      const memHw = memoryHomeworks.find((h) => String(h._id) === String(id));
      if (memHw) {
        if (!memHw.submissions) memHw.submissions = [];
        const mIdx = memHw.submissions.findIndex(
          (s) =>
            String(s.studentId) === String(studentUser._id) ||
            s.studentEmail === studentUser.email
        );
        if (mIdx !== -1) {
          memHw.submissions[mIdx] = { ...memHw.submissions[mIdx], ...submissionData };
        } else {
          memHw.submissions.push(submissionData);
        }
      }

      return res.status(200).json({
        message: "Assignment response submitted successfully to MongoDB",
        submission: submissionData,
      });
    }

    // Memory fallback
    const memHw = memoryHomeworks.find((h) => String(h._id) === String(id));
    if (!memHw) {
      return res.status(404).json({ message: "Homework assignment not found" });
    }
    if (!memHw.submissions) memHw.submissions = [];
    const mIdx = memHw.submissions.findIndex(
      (s) =>
        String(s.studentId) === String(studentUser._id) ||
        s.studentEmail === studentUser.email
    );
    if (mIdx !== -1) {
      memHw.submissions[mIdx] = { ...memHw.submissions[mIdx], ...submissionData };
    } else {
      memHw.submissions.push(submissionData);
    }

    res.status(200).json({
      message: "Assignment response submitted successfully (Offline mode)",
      submission: submissionData,
    });
  } catch (error) {
    console.error("Error submitting homework:", error);
    res.status(500).json({ message: error.message || "Server error submitting homework" });
  }
};

// @desc    Get all student submissions for an assignment (Teacher only)
// @route   GET /api/homework/:id/submissions
// @access  Teacher
const getHomeworkSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    let homework = null;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      homework = await Homework.findById(id);
    }
    if (!homework) {
      homework = memoryHomeworks.find((h) => String(h._id) === String(id));
    }

    if (!homework) {
      return res.status(404).json({ message: "Homework assignment not found" });
    }

    // 1. Fetch enrolled students
    let enrolledStudents = [];
    if (isDbConnected()) {
      enrolledStudents = await User.find({ role: "student" })
        .select("name email batch phone")
        .sort({ name: 1 });
    }

    // Fallback if no students in DB or memory mode
    if (enrolledStudents.length === 0) {
      enrolledStudents = [
        {
          _id: "660000000000000000000002",
          name: "Kasun Perera",
          email: "student@physicslms.edu",
          batch: "A/L Physics 2026",
          phone: "+94 77 123 4567",
        },
        {
          _id: "660000000000000000000003",
          name: "Dinithi Jayawardena",
          email: "dinithi.j@physicslms.edu",
          batch: "A/L Physics 2026",
          phone: "+94 71 987 6543",
        },
        {
          _id: "660000000000000000000004",
          name: "Malik Fernando",
          email: "malik.f@physicslms.edu",
          batch: "A/L Physics 2026",
          phone: "+94 76 555 4321",
        },
      ];
    }

    const submissionsList = homework.submissions || [];

    // 2. Map roster with submission details
    const studentRoster = enrolledStudents.map((student) => {
      const sObj = typeof student.toObject === "function" ? student.toObject() : student;
      const sub = submissionsList.find(
        (s) =>
          String(s.studentId) === String(sObj._id) ||
          s.studentEmail === sObj.email
      );

      return {
        studentId: sObj._id,
        studentName: sObj.name,
        studentEmail: sObj.email,
        batch: sObj.batch || "A/L Physics 2026",
        phone: sObj.phone || "",
        submitted: !!sub,
        submission: sub
          ? {
              studentName: sub.studentName || sObj.name,
              studentEmail: sub.studentEmail || sObj.email,
              submissionText: sub.submissionText,
              submissionLink: sub.submissionLink || "",
              status: sub.status || "Submitted",
              submittedAt: sub.submittedAt,
            }
          : null,
      };
    });

    const totalEnrolled = studentRoster.length;
    const totalSubmitted = studentRoster.filter((s) => s.submitted).length;

    res.json({
      homework: {
        _id: homework._id,
        title: homework.title,
        topic: homework.topic,
        dueDate: homework.dueDate,
        totalMarks: homework.totalMarks,
        submissionType: homework.submissionType,
        resourceAttachment: homework.resourceAttachment,
      },
      totalEnrolled,
      totalSubmitted,
      submissions: submissionsList,
      studentRoster,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Server error fetching submissions" });
  }
};

// @desc    Get all homework assignments submitted by the authenticated student
// @route   GET /api/homework/my-submissions
// @access  Student / Authenticated
const getMySubmissions = async (req, res) => {
  try {
    const studentUser = req.user;
    const studentId = studentUser ? String(studentUser._id) : null;
    const studentEmail = studentUser ? studentUser.email : null;

    let allHomeworks = [];
    if (isDbConnected()) {
      allHomeworks = await Homework.find({
        $or: [
          ...(studentId ? [{ "submissions.studentId": studentId }] : []),
          ...(studentEmail ? [{ "submissions.studentEmail": studentEmail }] : []),
        ],
      });
    } else {
      allHomeworks = memoryHomeworks.filter((h) =>
        (h.submissions || []).some(
          (s) =>
            (studentId && String(s.studentId) === studentId) ||
            (studentEmail && s.studentEmail === studentEmail)
        )
      );
    }

    const myResults = allHomeworks.map((h) => {
      const sub = (h.submissions || []).find(
        (s) =>
          (studentId && String(s.studentId) === studentId) ||
          (studentEmail && s.studentEmail === studentEmail)
      );
      return {
        homeworkId: h._id,
        title: h.title,
        topic: h.topic,
        dueDate: h.dueDate,
        totalMarks: h.totalMarks,
        submission: sub,
      };
    });

    res.json(myResults);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching my submissions" });
  }
};

module.exports = {
  getHomeworks,
  getHomeworkById,
  createHomework,
  updateHomework,
  deleteHomework,
  submitHomework,
  getHomeworkSubmissions,
  getMySubmissions,
};
