const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, "Question text is required"],
    trim: true,
  },
  options: {
    type: [String],
    validate: [
      (val) => val.length >= 2,
      "At least 2 options are required for each question",
    ],
  },
  correctAnswerIndex: {
    type: Number,
    required: [true, "Correct answer index is required"],
    min: 0,
  },
  explanation: {
    type: String,
    default: "",
    trim: true,
  },
  marks: {
    type: Number,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, "Topic category is required"],
      default: "General Physics",
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },
    timeLimitMinutes: {
      type: Number,
      default: 15,
    },
    passingScore: {
      type: Number,
      default: 50, // Percentage
    },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },
    questions: [questionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);
