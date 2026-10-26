const mongoose = require("mongoose");

const studyMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Material title is required"],
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
    resourceType: {
      type: String,
      enum: ["PDF Document", "Lecture Notes", "Formula Sheet", "External Link", "Slides"],
      default: "PDF Document",
    },
    resourceUrl: {
      type: String,
      required: [true, "Resource URL or document link is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    fileSize: {
      type: String,
      default: "1.5 MB",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StudyMaterial", studyMaterialSchema);
