

const express = require("express");

const app = express();

// Middleware to read JSON request bodies
app.use(express.json());

// Temporary Physics Lessons Data
let lessons = [
  { id: 1, title: "Mechanics" },
  { id: 2, title: "Electricity" },
  { id: 3, title: "Waves" }
];

let nextLessonId = 4;

// Route 01 - Welcome Message
app.get("/", (req, res) => {
  res.send("Welcome to Physics LMS Backend!");
});

// Route 02 - Get All Lessons
app.get("/api/lessons", (req, res) => {
  res.json(lessons);
});

// Route 03 - Add a New Lesson
app.post("/api/lessons", (req, res) => {
  const { title } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      message: "Valid lesson title is required"
    });
  }

  const newLesson = {
    id: nextLessonId++,
    title: title.trim()
  };

  lessons.push(newLesson);

  console.log("New Lesson Added:", newLesson);

  res.status(201).json(newLesson);
});
 


 // Route 04 - Update a Physics Lesson
app.put("/api/lessons/:id", (req, res) => {

  const lessonId = Number(req.params.id);

  const lesson = lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    return res.status(404).json({
      message: "Lesson not found"
    });
  }

  const { title } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      message: "Valid lesson title is required"
    });
  }

  lesson.title = title.trim();

  console.log("Lesson Updated:", lesson);

  res.status(200).json(lesson);

});


 // Route 05 - Delete a Physics Lesson
app.delete("/api/lessons/:id", (req, res) => {

  const lessonId = Number(req.params.id);

  const lessonIndex = lessons.findIndex(
    (item) => item.id === lessonId
  );

  if (lessonIndex === -1) {
    return res.status(404).json({
      message: "Lesson not found"
    });
  }

  const deletedLesson = lessons.splice(lessonIndex, 1)[0];

  console.log("Lesson Deleted:", deletedLesson);

  res.status(200).json({
    message: "Lesson deleted successfully",
    deletedLesson: deletedLesson
  });

});


// Start Server
app.listen(5000, () => {
  console.log("Physics LMS Server running on port 5000");
});
