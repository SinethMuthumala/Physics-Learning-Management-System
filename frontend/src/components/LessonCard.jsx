import React from "react";
import { Clock, BarChart2, Video, Edit3, Trash2, BookOpen } from "lucide-react";

export default function LessonCard({
  lesson,
  isTeacher,
  onView,
  onEdit,
  onDelete,
}) {
  const getTopicBadgeClass = (topic) => {
    switch (topic) {
      case "Mechanics": return "badge-blue";
      case "Electricity & Magnetism": return "badge-amber";
      case "Waves & Optics": return "badge-emerald";
      case "Thermal Physics": return "badge-rose";
      case "Modern Physics": return "badge-cyan";
      default: return "badge-blue";
    }
  };

  const getDifficultyBadgeClass = (diff) => {
    switch (diff) {
      case "Beginner": return "badge-emerald";
      case "Intermediate": return "badge-blue";
      case "Advanced": return "badge-rose";
      default: return "badge-blue";
    }
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Top badges */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", gap: "0.5rem", flexWrap: "wrap" }}>
        <span className={`badge ${getTopicBadgeClass(lesson.topic)}`}>
          {lesson.topic}
        </span>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <span className={`badge ${getDifficultyBadgeClass(lesson.difficulty)}`}>
            {lesson.difficulty || "Intermediate"}
          </span>
          {lesson.status === "Draft" && (
            <span className="badge badge-amber">Draft</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.6rem" }}>
        {lesson.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: "0.88rem",
        color: "var(--text-muted)",
        marginBottom: "1.2rem",
        flex: 1,
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
      }}>
        {lesson.description || "In-depth Physics principles, derivations, and practice problem applications."}
      </p>

      {/* Metadata Row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        fontSize: "0.8rem",
        color: "var(--text-dim)",
        borderTop: "1px solid var(--surface-border-subtle)",
        paddingTop: "0.85rem",
        marginBottom: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <Clock size={14} color="var(--electric-blue)" /> {lesson.durationMinutes || 60} mins
        </div>
        {lesson.videoUrl && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#38BDF8" }}>
            <Video size={14} /> Video Lecture
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <button
          onClick={() => onView(lesson)}
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
        >
          <BookOpen size={14} /> View Lesson
        </button>

        {isTeacher && (
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              onClick={() => onEdit(lesson)}
              className="btn btn-secondary btn-sm"
              title="Edit Lesson"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(lesson)}
              className="btn btn-secondary btn-sm"
              style={{ color: "var(--danger-rose)" }}
              title="Delete Lesson"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
