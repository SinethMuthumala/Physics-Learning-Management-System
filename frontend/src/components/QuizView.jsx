import React, { useState } from "react";
import { HelpCircle, Clock, Award, Plus, Trash2, CheckCircle2, Play, Users, BookOpen } from "lucide-react";
import ActiveQuizModal from "./ActiveQuizModal";
import CreateQuizModal from "./CreateQuizModal";

export default function QuizView({
  quizzes,
  quizResults,
  isTeacher,
  user,
  onAddQuiz,
  onDeleteQuiz,
  onSubmitQuiz,
}) {
  const [activeTab, setActiveTab] = useState("quizzes"); // "quizzes" or "results"
  const [selectedQuizForActive, setSelectedQuizForActive] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Physics MCQ Assessments & Tests</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Real-time timed quizzes with instant grading, score calculation, and concept explanations
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {isTeacher && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              <Plus size={16} /> Create New Quiz
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--surface-border)", paddingBottom: "0.5rem" }}>
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`btn btn-sm ${activeTab === "quizzes" ? "btn-primary" : "btn-secondary"}`}
        >
          <HelpCircle size={15} /> Available Tests ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`btn btn-sm ${activeTab === "results" ? "btn-primary" : "btn-secondary"}`}
        >
          <Award size={15} /> {isTeacher ? "Student Submissions" : "My Results History"} ({quizResults.length})
        </button>
      </div>

      {/* QUIZZES TAB */}
      {activeTab === "quizzes" && (
        <>
          {quizzes.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <HelpCircle size={40} style={{ margin: "0 auto 1rem auto", opacity: 0.4 }} />
              <h3>No quizzes published yet</h3>
              <p style={{ fontSize: "0.9rem" }}>Quizzes created by the instructor will appear here.</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "1.25rem"
            }}>
              {quizzes.map((quiz) => {
                const totalQuestions = quiz.questions ? quiz.questions.length : 0;
                const totalMarks = quiz.questions
                  ? quiz.questions.reduce((acc, q) => acc + (q.marks || 1), 0)
                  : 0;

                return (
                  <div key={quiz._id} className="card" style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <span className="badge badge-blue">{quiz.topic}</span>
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={12} /> Pass: {quiz.passingScore || 50}%
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                      {quiz.title}
                    </h3>

                    {/* Metadata */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.25rem",
                      fontSize: "0.85rem",
                      color: "var(--text-dim)",
                      marginBottom: "1.25rem",
                      padding: "0.6rem 0.75rem",
                      background: "var(--secondary-navy)",
                      borderRadius: "var(--radius-md)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Clock size={15} color="var(--cyan-accent)" /> {quiz.timeLimitMinutes || 15} mins
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <BookOpen size={15} color="var(--electric-blue)" /> {totalQuestions} MCQs
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Award size={15} color="var(--warning-amber)" /> {totalMarks} Marks
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginTop: "auto" }}>
                      <button
                        onClick={() => setSelectedQuizForActive(quiz)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Play size={14} /> Start Quiz Assessment
                      </button>

                      {isTeacher && (
                        <button
                          onClick={() => onDeleteQuiz(quiz._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: "var(--danger-rose)" }}
                          title="Delete Quiz"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* RESULTS TAB */}
      {activeTab === "results" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {quizResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
              <Award size={40} style={{ margin: "0 auto 1rem auto", opacity: 0.4 }} />
              <h3>No quiz submissions recorded yet</h3>
              <p style={{ fontSize: "0.9rem" }}>Complete a quiz to see scored results and breakdown.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "var(--secondary-navy)", borderBottom: "1px solid var(--surface-border)" }}>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Student</th>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Quiz Title</th>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Marks</th>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Percentage</th>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Status</th>
                    <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Date Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {quizResults.map((r, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--surface-border-subtle)" }}>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>
                        {r.studentName}
                        <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 400 }}>{r.studentEmail}</div>
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>{r.quizTitle}</td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>
                        {r.score} / {r.totalMarks}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: r.passed ? "var(--success-emerald)" : "var(--danger-rose)" }}>
                        {r.percentage}%
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span className={`badge ${r.passed ? "badge-emerald" : "badge-rose"}`}>
                          {r.passed ? "Passed" : "Needs Review"}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 1rem", color: "var(--text-dim)", fontSize: "0.8rem" }}>
                        {new Date(r.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Active Quiz Taking Modal */}
      {selectedQuizForActive && (
        <ActiveQuizModal
          quiz={selectedQuizForActive}
          isOpen={!!selectedQuizForActive}
          onClose={() => setSelectedQuizForActive(null)}
          onSubmitQuiz={onSubmitQuiz}
          user={user}
        />
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <CreateQuizModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={onAddQuiz}
        />
      )}
    </div>
  );
}
