const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
    },
    submissionText: {
      type: String,
      required: [true, "Submission content or link is required"],
      trim: true,
    },
    submissionLink: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Submitted", "Graded", "Pending"],
      default: "Submitted",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const homeworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Homework title is required"],
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
    description: {
      type: String,
      required: [true, "Instructions or problem description required"],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    submissionType: {
      type: String,
      enum: ["Handwritten / In-Class", "Online Submission", "Worksheet"],
      default: "Handwritten / In-Class",
    },
    resourceAttachment: {
      type: String,
      default: "",
    },
    submissions: {
      type: [submissionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Homework", homeworkSchema);
