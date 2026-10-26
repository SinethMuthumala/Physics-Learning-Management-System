import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export default function LessonFormModal({ isOpen, onClose, onSave, lessonToEdit }) {
  const [formData, setFormData] = useState({
    title: "",
    topic: "Mechanics",
    description: "",
    durationMinutes: 60,
    difficulty: "Intermediate",
    videoUrl: "",
    status: "Published",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lessonToEdit) {
      setFormData({
        title: lessonToEdit.title || "",
        topic: lessonToEdit.topic || "Mechanics",
        description: lessonToEdit.description || "",
        durationMinutes: lessonToEdit.durationMinutes || 60,
        difficulty: lessonToEdit.difficulty || "Intermediate",
        videoUrl: lessonToEdit.videoUrl || "",
        status: lessonToEdit.status || "Published",
      });
    } else {
      setFormData({
        title: "",
        topic: "Mechanics",
        description: "",
        durationMinutes: 60,
        difficulty: "Intermediate",
        videoUrl: "",
        status: "Published",
      });
    }
    setError("");
  }, [lessonToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please enter a lesson title");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSave(formData, lessonToEdit?._id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save lesson");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: "1.3rem" }}>
            {lessonToEdit ? "Edit Physics Lesson" : "Create New Physics Lesson"}
          </h2>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.5rem" }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-rose)",
            color: "#FCA5A5",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            marginBottom: "1rem"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Lesson Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Projectile Motion & Trajectory Analysis"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Topic Area</label>
              <select
                className="form-select"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              >
                <option value="Mechanics">Mechanics</option>
                <option value="Electricity & Magnetism">Electricity & Magnetism</option>
                <option value="Waves & Optics">Waves & Optics</option>
                <option value="Thermal Physics">Thermal Physics</option>
                <option value="Modern Physics">Modern Physics</option>
                <option value="General Physics">General Physics</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <select
                className="form-select"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Estimated Duration (Mins)</label>
              <input
                type="number"
                min="10"
                max="300"
                className="form-input"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Publishing Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Video Lecture URL (YouTube or Direct)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Lesson Overview & Syllabus Objectives</label>
            <textarea
              className="form-textarea"
              placeholder="Outline the core laws, derivations, formulas, and typical exam questions covered in this session..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save size={16} /> {loading ? "Saving..." : lessonToEdit ? "Update Lesson" : "Create Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
