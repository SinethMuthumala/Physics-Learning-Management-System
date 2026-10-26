import React, { useState } from "react";
import { X, Plus, Trash2, Save, HelpCircle } from "lucide-react";

export default function CreateQuizModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Mechanics");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState(50);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      explanation: "",
      marks: 2,
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleQuestionChange = (idx, field, val) => {
    const updated = [...questions];
    updated[idx][field] = val;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
        explanation: "",
        marks: 2,
      },
    ]);
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a quiz title");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} text is empty`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is empty`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      setError("");
      await onSave({
        title: title.trim(),
        topic,
        timeLimitMinutes: Number(timeLimitMinutes),
        passingScore: Number(passingScore),
        questions,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create quiz");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "850px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.35rem" }}>Create New Physics MCQ Quiz</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Configure question sets, correct answer keys, and concept explanations
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            <X size={16} />
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
          {/* Main Quiz Metadata */}
          <div className="form-group">
            <label className="form-label">Quiz Assessment Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Waves, Superposition & Sound Intensity Quick Test"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Physics Topic</label>
              <select className="form-select" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="Mechanics">Mechanics</option>
                <option value="Electricity & Magnetism">Electricity & Magnetism</option>
                <option value="Waves & Optics">Waves & Optics</option>
                <option value="Thermal Physics">Thermal Physics</option>
                <option value="Modern Physics">Modern Physics</option>
                <option value="General Physics">General Physics</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Time Limit (Minutes)</label>
              <input
                type="number"
                min="5"
                max="120"
                className="form-input"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Passing Score (%)</label>
              <input
                type="number"
                min="20"
                max="100"
                className="form-input"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Questions Builder */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#93C5FD" }}>
                Questions ({questions.length})
              </h4>
              <button type="button" onClick={addQuestion} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add Question
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  style={{
                    background: "var(--secondary-navy)",
                    border: "1px solid var(--surface-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.25rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--electric-blue)" }}>
                      Question {qIdx + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIdx)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: "var(--danger-rose)", padding: "0.2rem 0.5rem" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Problem Statement *</label>
                    <textarea
                      className="form-textarea"
                      placeholder="State the physics question or numerical problem..."
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qIdx, "questionText", e.target.value)}
                      rows={2}
                      required
                    />
                  </div>

                  {/* 4 MCQ Options */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx}>
                        <label className="form-label" style={{ fontSize: "0.78rem" }}>
                          Option {String.fromCharCode(65 + optIdx)}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  {/* Correct Option and Marks */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ color: "var(--success-emerald)" }}>
                        Correct Answer
                      </label>
                      <select
                        className="form-select"
                        value={q.correctAnswerIndex}
                        onChange={(e) => handleQuestionChange(qIdx, "correctAnswerIndex", Number(e.target.value))}
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        <option value={2}>Option C</option>
                        <option value={3}>Option D</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Marks for Question</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="form-input"
                        value={q.marks}
                        onChange={(e) => handleQuestionChange(qIdx, "marks", Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.8rem" }}>
                      Concept Explanation (Shown to students after submission)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Formula: F = ma, substituting m=2kg, a=5ms^-2 gives 10N."
                      value={q.explanation}
                      onChange={(e) => handleQuestionChange(qIdx, "explanation", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--surface-border)", paddingTop: "1rem" }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              <Save size={16} /> {submitting ? "Publishing..." : "Publish Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
