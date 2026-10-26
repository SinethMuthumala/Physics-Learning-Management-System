const mongoose = require("mongoose");
const Lesson = require("../models/Lesson");

// Initial Seed Lessons
const initialLessonsSeed = [
  {
    _id: "660000000000000000000101",
    title: "Mechanics",
    topic: "Mechanics",
    description: "Newtonian mechanics, kinematics, dynamics, circular motion, gravitation, and energy conservation principles.",
    durationMinutes: 90,
    difficulty: "Intermediate",
    videoUrl: "https://www.youtube.com/watch?v=kKKM8Y-u7ds",
    order: 1,
    status: "Published",
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000102",
    title: "Electricity & Magnetism",
    topic: "Electricity & Magnetism",
    description: "Electric fields, Coulomb's law, capacitance, Kirchhoff's circuit laws, and electromagnetic induction.",
    durationMinutes: 80,
    difficulty: "Advanced",
    videoUrl: "https://www.youtube.com/watch?v=mdulzEf24vU",
    order: 2,
    status: "Published",
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000103",
    title: "Waves & Optics",
    topic: "Waves & Optics",
    description: "Wave properties, superposition, resonance, Doppler effect, geometric reflection, refraction, and wave optics.",
    durationMinutes: 75,
    difficulty: "Intermediate",
    videoUrl: "https://www.youtube.com/watch?v=CVsdXKO9xlk",
    order: 3,
    status: "Published",
    createdAt: new Date(),
  },
];

let memoryLessons = JSON.parse(JSON.stringify(initialLessonsSeed));

const isDbConnected = () => mongoose.connection.readyState === 1;
const isEnvConfigured = () => Boolean(process.env.MONGO_URI && process.env.MONGO_URI.trim() !== "");

// @desc    Get all physics lessons
// @route   GET /api/lessons
// @access  Public
const getLessons = async (req, res) => {
  try {
    const { topic, search } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (topic && topic !== "All") query.topic = topic;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      let lessons = await Lesson.find(query).sort({ order: 1, createdAt: 1 });

      if (lessons.length === 0 && !topic && !search) {
        const totalCount = await Lesson.countDocuments();
        if (totalCount === 0) {
          lessons = await Lesson.insertMany(initialLessonsSeed.map(({ _id, ...rest }) => rest));
          console.log("🌱 Auto-seeded initial Physics lessons into MongoDB Atlas");
        }
      }
      if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "MongoDB-Atlas");
      return res.json(lessons);
    }

    // If MONGO_URI was provided in .env but connection is down, notify explicitly rather than silently masking
    if (isEnvConfigured()) {
      return res.status(503).json({
        message: "MongoDB Atlas is configured in .env but not connected. Please verify your Atlas IP whitelist and credentials.",
      });
    }

    // Temporary Offline In-Memory Fallback Mode (only when MONGO_URI is omitted)
    if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "in-memory-fallback");
    let filtered = [...memoryLessons];
    if (topic && topic !== "All") {
      filtered = filtered.filter((l) => l.topic === topic);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (l) => l.title.toLowerCase().includes(q) || (l.description && l.description.toLowerCase().includes(q))
      );
    }
    return res.json(filtered);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ message: "Server error fetching lessons" });
  }
};

// @desc    Get single lesson by ID
// @route   GET /api/lessons/:id
// @access  Public
const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const lesson = await Lesson.findById(id);
        if (lesson) {
          if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "MongoDB-Atlas");
          return res.json(lesson);
        }
      }
      return res.status(404).json({ message: "Lesson not found in MongoDB Atlas" });
    }

    if (isEnvConfigured()) {
      return res.status(503).json({
        message: "MongoDB Atlas is configured but not connected. Unable to fetch lesson.",
      });
    }

    // Memory / legacy index fallback
    const numeric = Number(id);
    const found = memoryLessons.find(
      (l, idx) => String(l._id) === String(id) || (numeric && (idx + 1 === numeric || l.order === numeric))
    );

    if (!found) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "in-memory-fallback");
    res.json(found);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching lesson" });
  }
};

// @desc    Create a new lesson
// @route   POST /api/lessons
// @access  Protected (Teacher)
const createLesson = async (req, res) => {
  try {
    const { title, topic, description, durationMinutes, difficulty, videoUrl, order, status } = req.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Valid lesson title is required" });
    }

    const lessonData = {
      title: title.trim(),
      topic: topic || "Mechanics",
      description: description ? description.trim() : "",
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
      difficulty: difficulty || "Intermediate",
      videoUrl: videoUrl ? videoUrl.trim() : "",
      order: order ? Number(order) : 1,
      status: status || "Published",
    };

    if (isDbConnected()) {
      lessonData.order = order ? Number(order) : (await Lesson.countDocuments()) + 1;
      const newLesson = await Lesson.create(lessonData);
      console.log(`💾 Saved lesson to MongoDB Atlas: "${newLesson.title}" (ID: ${newLesson._id})`);
      if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "MongoDB-Atlas");
      return res.status(201).json(newLesson);
    }

    // If MONGO_URI is set, never silently store in memory without warning
    if (isEnvConfigured()) {
      return res.status(503).json({
        message: "Database unavailable: MongoDB Atlas is configured in backend/.env but connection is not established. Cannot persist lesson to MongoDB Atlas.",
      });
    }

    // Offline in-memory mode
    lessonData.order = order ? Number(order) : memoryLessons.length + 1;
    const newLesson = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...lessonData,
      createdAt: new Date(),
    };
    memoryLessons.push(newLesson);
    if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "in-memory-fallback");
    res.status(201).json(newLesson);
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ message: error.message || "Server error creating lesson" });
  }
};

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Protected (Teacher)
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, topic, description, durationMinutes, difficulty, videoUrl, order, status } = req.body;

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return res.status(400).json({ message: "Valid lesson title is required" });
    }

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid MongoDB ObjectId" });
      }

      const updated = await Lesson.findByIdAndUpdate(
        id,
        {
          ...(title && { title: title.trim() }),
          ...(topic && { topic }),
          ...(description !== undefined && { description: description.trim() }),
          ...(durationMinutes !== undefined && { durationMinutes: Number(durationMinutes) }),
          ...(difficulty && { difficulty }),
          ...(videoUrl !== undefined && { videoUrl: videoUrl.trim() }),
          ...(order !== undefined && { order: Number(order) }),
          ...(status && { status }),
        },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Lesson not found in MongoDB Atlas" });
      }

      console.log(`💾 Updated lesson in MongoDB Atlas: "${updated.title}" (ID: ${updated._id})`);
      if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "MongoDB-Atlas");
      return res.status(200).json(updated);
    }

    if (isEnvConfigured()) {
      return res.status(503).json({
        message: "MongoDB Atlas is configured but not connected. Cannot update lesson.",
      });
    }

    // Memory / legacy index fallback
    const numeric = Number(id);
    const index = memoryLessons.findIndex(
      (l, idx) => String(l._id) === String(id) || (numeric && (idx + 1 === numeric || l.order === numeric))
    );

    if (index === -1) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (title !== undefined) memoryLessons[index].title = title.trim();
    if (topic !== undefined) memoryLessons[index].topic = topic;
    if (description !== undefined) memoryLessons[index].description = description.trim();
    if (durationMinutes !== undefined) memoryLessons[index].durationMinutes = Number(durationMinutes);
    if (difficulty !== undefined) memoryLessons[index].difficulty = difficulty;
    if (videoUrl !== undefined) memoryLessons[index].videoUrl = videoUrl.trim();
    if (order !== undefined) memoryLessons[index].order = Number(order);
    if (status !== undefined) memoryLessons[index].status = status;

    if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "in-memory-fallback");
    res.status(200).json(memoryLessons[index]);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error updating lesson" });
  }
};

// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Protected (Teacher)
const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid MongoDB ObjectId" });
      }

      const deleted = await Lesson.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Lesson not found in MongoDB Atlas" });
      }

      console.log(`💾 Deleted lesson from MongoDB Atlas: "${deleted.title}" (ID: ${deleted._id})`);
      if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "MongoDB-Atlas");
      return res.status(200).json({
        message: "Lesson deleted successfully from MongoDB Atlas",
        deletedLesson: deleted,
      });
    }

    if (isEnvConfigured()) {
      return res.status(503).json({
        message: "MongoDB Atlas is configured but not connected. Cannot delete lesson.",
      });
    }

    // Memory / legacy index fallback
    const numeric = Number(id);
    const index = memoryLessons.findIndex(
      (l, idx) => String(l._id) === String(id) || (numeric && (idx + 1 === numeric || l.order === numeric))
    );

    if (index === -1) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const removed = memoryLessons.splice(index, 1)[0];
    if (typeof res.setHeader === "function") res.setHeader("X-Storage-Engine", "in-memory-fallback");
    res.status(200).json({
      message: "Lesson deleted successfully",
      deletedLesson: removed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error deleting lesson" });
  }
};

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};
