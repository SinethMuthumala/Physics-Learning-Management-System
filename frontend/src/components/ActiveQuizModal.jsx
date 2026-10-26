import React, { useState, useEffect } from "react";
import { X, Clock, AlertCircle, CheckCircle2, XCircle, Award, ArrowRight, RotateCcw } from "lucide-react";

export default function ActiveQuizModal({ quiz, isOpen, onClose, onSubmitQuiz, user }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((quiz?.timeLimitMinutes || 10) * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || quizResult) return;
    setTimeLeft((quiz?.timeLimitMinutes || 10) * 60);
    setSelectedAnswers({});
    setQuizResult(null);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, quiz]);

  if (!isOpen || !quiz) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOptionSelect = (qIdx, optIdx) => {
    if (quizResult) return; // Prevent change after submit
    setSelectedAnswers({
      ...selectedAnswers,
      [qIdx]: optIdx,
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || quizResult) return;

    const answersPayload = quiz.questions.map((_, idx) => ({
      questionIndex: idx,
      selectedOptionIndex: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1,
    }));

    try {
      setIsSubmitting(true);
      const result = await onSubmitQuiz(quiz._id, {
        studentName: user?.name || "Student",
        studentEmail: user?.email || "student@physicslms.edu",
        answers: answersPayload,
      });
      setQuizResult(result);
    } catch (err) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    handleSubmit();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "800px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="badge badge-blue" style={{ marginBottom: "0.4rem" }}>
              {quiz.topic}
            </span>
            <h2 style={{ fontSize: "1.35rem" }}>{quiz.title}</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {!quizResult && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: timeLeft < 120 ? "var(--danger-bg)" : "var(--secondary-navy)",
                border: `1px solid ${timeLeft < 120 ? "var(--danger-rose)" : "var(--surface-border)"}`,
                color: timeLeft < 120 ? "#F87171" : "var(--cyan-accent)",
                padding: "0.35rem 0.75rem",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
                fontSize: "0.9rem"
              }}>
                <Clock size={16} /> {formatTime(timeLeft)}
              </div>
            )}
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* QUIZ RESULT BANNER (If submitted) */}
        {quizResult && (
          <div style={{
            background: quizResult.passed ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${quizResult.passed ? "var(--success-emerald)" : "var(--danger-rose)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            textAlign: "center",
            marginBottom: "2rem"
          }}>
            <div style={{ display: "inline-flex", marginBottom: "0.5rem" }}>
              {quizResult.passed ? (
                <Award size={48} color="var(--success-emerald)" />
              ) : (
                <AlertCircle size={48} color="var(--danger-rose)" />
              )}
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800 }}>
              {quizResult.passed ? "Assessment Passed! Excellent Work" : "Practice Needed"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              {quizResult.message}
            </p>

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              marginTop: "1rem",
              borderTop: "1px solid var(--surface-border-subtle)",
              paddingTop: "1rem"
            }}>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--electric-blue)" }}>
                  {quizResult.score} / {quizResult.totalMarks}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Marks Earned</div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: quizResult.passed ? "var(--success-emerald)" : "var(--danger-rose)" }}>
                  {quizResult.percentage}%
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Percentage</div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--text-main)" }}>
                  {quizResult.passingScore}%
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Pass Threshold</div>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
          {quiz.questions.map((q, qIdx) => {
            const feedback = quizResult?.detailedFeedback?.find((df) => df.questionIndex === qIdx);

            return (
              <div
                key={qIdx}
                style={{
                  background: "var(--secondary-navy)",
                  border: `1px solid ${
                    feedback
                      ? feedback.isCorrect
                        ? "var(--success-emerald)"
                        : "var(--danger-rose)"
                      : "var(--surface-border)"
                  }`,
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--electric-blue)" }}>
                    Question {qIdx + 1} of {quiz.questions.length}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                    {q.marks || 1} {q.marks === 1 ? "Mark" : "Marks"}
                  </span>
                </div>

                <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", lineHeight: 1.5 }}>
                  {q.questionText}
                </div>

                {/* Options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    const isCorrectAnswer = feedback && feedback.correctAnswerIndex === optIdx;
                    const isWrongChoice = feedback && isSelected && !feedback.isCorrect;

                    let optBg = "var(--surface-navy)";
                    let optBorder = "var(--surface-border)";
                    let optColor = "var(--text-main)";

                    if (feedback) {
                      if (isCorrectAnswer) {
                        optBg = "var(--success-bg)";
                        optBorder = "var(--success-emerald)";
                        optColor = "#34D399";
                      } else if (isWrongChoice) {
                        optBg = "var(--danger-bg)";
                        optBorder = "var(--danger-rose)";
                        optColor = "#F87171";
                      }
                    } else if (isSelected) {
                      optBg = "rgba(59, 130, 246, 0.2)";
                      optBorder = "var(--electric-blue)";
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleOptionSelect(qIdx, optIdx)}
                        style={{
                          background: optBg,
                          border: `1px solid ${optBorder}`,
                          color: optColor,
                          borderRadius: "var(--radius-md)",
                          padding: "0.75rem 1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: quizResult ? "default" : "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: `1px solid ${optBorder}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: isSelected ? "var(--electric-blue)" : "transparent",
                            color: isSelected ? "#FFFFFF" : "inherit"
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span style={{ fontSize: "0.92rem" }}>{opt}</span>
                        </div>

                        {feedback && isCorrectAnswer && (
                          <CheckCircle2 size={18} color="var(--success-emerald)" />
                        )}
                        {feedback && isWrongChoice && (
                          <XCircle size={18} color="var(--danger-rose)" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {feedback && feedback.explanation && (
                  <div style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "rgba(11, 19, 43, 0.6)",
                    borderLeft: "3px solid var(--electric-blue)",
                    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)"
                  }}>
                    <strong style={{ color: "#93C5FD" }}>Physics Concept Explanation: </strong>
                    {feedback.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid var(--surface-border)",
          paddingTop: "1rem"
        }}>
          {quizResult ? (
            <button onClick={onClose} className="btn btn-primary" style={{ width: "100%" }}>
              Done Reviewing Score
            </button>
          ) : (
            <>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Answered {Object.keys(selectedAnswers).length} of {quiz.questions.length} questions
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  <Award size={16} /> {isSubmitting ? "Calculating Marks..." : "Submit Answers"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
