import React, { useState } from "react";
import {
  CheckSquare,
  Calendar,
  Award,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  X,
  Clock,
  Send,
  CheckCircle2,
  Users,
  Search,
  FileText,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { api } from "../services/api";

export default function HomeworkView({
  homeworks,
  isTeacher,
  user,
  onAddHomework,
  onUpdateHomework,
  onDeleteHomework,
  onRefreshHomeworks,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingHw, setEditingHw] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    topic: "Mechanics",
    description: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    totalMarks: 50,
    submissionType: "Handwritten / In-Class",
    resourceAttachment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Student submission state
  const [submittingHwId, setSubmittingHwId] = useState(null);
  const [studentSubmissionText, setStudentSubmissionText] = useState("");
  const [isSubmittingSolution, setIsSubmittingSolution] = useState(false);

  // Teacher submissions viewing modal state
  const [viewingSubmissionsHw, setViewingSubmissionsHw] = useState(null);
  const [submissionsData, setSubmissionsData] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [rosterFilter, setRosterFilter] = useState("all"); // "all" | "submitted" | "pending"
  const [searchRosterQuery, setSearchRosterQuery] = useState("");

  const formatDueDate = (dateStr) => {
    if (!dateStr) return "TBA";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let badgeClass = "badge-emerald";
    let statusText = `${diffDays} days left`;

    if (diffDays < 0) {
      badgeClass = "badge-rose";
      statusText = "Past Due";
    } else if (diffDays <= 2) {
      badgeClass = "badge-amber";
      statusText = `Due soon (${diffDays}d)`;
    }

    return { formatted, badgeClass, statusText };
  };

  const handleOpenCreate = () => {
    setEditingHw(null);
    setFormData({
      title: "",
      topic: "Mechanics",
      description: "",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalMarks: 50,
      submissionType: "Online Submission",
      resourceAttachment: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (hw) => {
    setEditingHw(hw);
    setFormData({
      title: hw.title || "",
      topic: hw.topic || "Mechanics",
      description: hw.description || "",
      dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString().split("T")[0] : "",
      totalMarks: hw.totalMarks || 50,
      submissionType: hw.submissionType || "Online Submission",
      resourceAttachment: hw.resourceAttachment || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.dueDate) return;

    try {
      setSubmitting(true);
      if (editingHw) {
        if (onUpdateHomework) {
          await onUpdateHomework(editingHw._id, formData);
        }
      } else {
        await onAddHomework(formData);
      }
      setShowModal(false);
      setEditingHw(null);
    } catch (err) {
      alert("Error saving homework: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Open inline submission form for student
  const handleOpenStudentSubmission = (hw) => {
    setSubmittingHwId(hw._id);
    if (hw.mySubmission && hw.mySubmission.submissionText) {
      setStudentSubmissionText(hw.mySubmission.submissionText);
    } else {
      setStudentSubmissionText("");
    }
  };

  // Student confirms submission
  const handleStudentSubmit = async (hwId) => {
    if (!studentSubmissionText.trim()) {
      alert("Please provide your solution note or file link.");
      return;
    }

    try {
      setIsSubmittingSolution(true);

      const cleanText = studentSubmissionText.trim();
      const urlMatch = cleanText.match(/https?:\/\/[^\s]+/);
      const submissionLink = urlMatch ? urlMatch[0] : "";

      const res = await api.submitHomework(hwId, {
        submissionText: cleanText,
        submissionLink: submissionLink,
      });

      alert(res.message || "Assignment response recorded successfully in MongoDB!");
      setSubmittingHwId(null);
      setStudentSubmissionText("");

      if (onRefreshHomeworks) {
        await onRefreshHomeworks();
      }
    } catch (err) {
      alert("Submission error: " + err.message);
    } finally {
      setIsSubmittingSolution(false);
    }
  };

  // Teacher opens submissions viewer
  const handleOpenSubmissionsModal = async (hw) => {
    setViewingSubmissionsHw(hw);
    setLoadingSubmissions(true);
    setRosterFilter("all");
    setSearchRosterQuery("");

    try {
      const data = await api.getHomeworkSubmissions(hw._id);
      setSubmissionsData(data);
    } catch (err) {
      alert("Error loading submissions: " + err.message);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleCloseSubmissionsModal = () => {
    setViewingSubmissionsHw(null);
    setSubmissionsData(null);
  };

  // Filter student roster
  const filteredRoster = (submissionsData?.studentRoster || []).filter((item) => {
    const matchesFilter =
      rosterFilter === "all" ||
      (rosterFilter === "submitted" && item.submitted) ||
      (rosterFilter === "pending" && !item.submitted);

    const matchesSearch =
      item.studentName.toLowerCase().includes(searchRosterQuery.toLowerCase()) ||
      item.studentEmail.toLowerCase().includes(searchRosterQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalEnrolled = submissionsData?.totalEnrolled || 0;
  const totalSubmitted = submissionsData?.totalSubmitted || 0;
  const totalPending = Math.max(0, totalEnrolled - totalSubmitted);
  const submissionRate = totalEnrolled > 0 ? Math.round((totalSubmitted / totalEnrolled) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>
            Physics Homework & Problem Sets
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Weekly practice problems, analytical exercises, and student solution submissions
          </p>
        </div>
        {isTeacher && (
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={16} /> Assign New Homework
          </button>
        )}
      </div>

      {/* Homework List */}
      {homeworks.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "var(--text-muted)",
          }}
        >
          <CheckSquare size={40} style={{ margin: "0 auto 1rem auto", opacity: 0.4 }} />
          <h3>No homework assignments active</h3>
          <p style={{ fontSize: "0.9rem" }}>Check back later or review your previous lessons.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {homeworks.map((hw) => {
            const dueInfo = formatDueDate(hw.dueDate);
            const isSubmitted =
              hw.isSubmitted ||
              (hw.mySubmission !== null && hw.mySubmission !== undefined);
            const subsCount =
              hw.submissionsCount !== undefined
                ? hw.submissionsCount
                : hw.submissions
                ? hw.submissions.length
                : 0;

            return (
              <div
                key={hw._id}
                className="card"
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        marginBottom: "0.4rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="badge badge-blue">{hw.topic}</span>
                      <span className={`badge ${dueInfo.badgeClass}`}>
                        <Clock size={11} /> {dueInfo.statusText}
                      </span>
                      {isTeacher ? (
                        <span
                          className="badge"
                          style={{
                            background: "rgba(59, 130, 246, 0.15)",
                            border: "1px solid #3B82F6",
                            color: "#93C5FD",
                          }}
                        >
                          <Users size={11} /> {subsCount} Submissions
                        </span>
                      ) : isSubmitted ? (
                        <span className="badge badge-emerald">
                          <CheckCircle2 size={11} /> Submitted
                        </span>
                      ) : null}
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{hw.title}</h3>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div
                      className="badge badge-amber"
                      style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                    >
                      <Award size={13} /> {hw.totalMarks} Marks
                    </div>
                    {isTeacher && (
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          onClick={() => handleOpenSubmissionsModal(hw)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            borderColor: "var(--electric-blue)",
                            color: "var(--cyan-accent)",
                          }}
                          title="View Student Submissions"
                        >
                          <Users size={14} /> View Submissions ({subsCount})
                        </button>
                        <button
                          onClick={() => handleOpenEdit(hw)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Assignment"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteHomework(hw._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: "var(--danger-rose)" }}
                          title="Delete Assignment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--secondary-navy)",
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: "var(--text-main)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {hw.description}
                </div>

                {/* If student has already submitted, display their submission summary */}
                {!isTeacher && hw.mySubmission && (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.85rem 1rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--success-emerald)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <CheckCircle2 size={14} /> Your Submitted Solution
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        Submitted on{" "}
                        {new Date(hw.mySubmission.submittedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div style={{ color: "var(--text-main)", whiteSpace: "pre-line" }}>
                      {hw.mySubmission.submissionText}
                    </div>
                    {hw.mySubmission.submissionLink && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <a
                          href={hw.mySubmission.submissionLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "0.8rem", padding: "0.25rem 0.6rem" }}
                        >
                          <ExternalLink size={12} /> Open Submitted File / Link
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    borderTop: "1px solid var(--surface-border-subtle)",
                    paddingTop: "0.75rem",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <Calendar size={14} color="var(--electric-blue)" /> Due:{" "}
                      <strong>{dueInfo.formatted}</strong>
                    </span>
                    <span>
                      Submission Mode: <strong>{hw.submissionType || "Online Submission"}</strong>
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {hw.resourceAttachment && (
                      <a
                        href={hw.resourceAttachment}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={13} /> Worksheet Attachment
                      </a>
                    )}

                    {!isTeacher && (
                      <button
                        onClick={() => handleOpenStudentSubmission(hw)}
                        className={`btn btn-sm ${isSubmitted ? "btn-secondary" : "btn-primary"}`}
                      >
                        <Send size={13} /> {isSubmitted ? "Resubmit / Edit Solution" : "Submit Solution"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Student Submission Box */}
                {submittingHwId === hw._id && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      padding: "1.25rem",
                      background: "var(--surface-navy)",
                      border: "1px solid var(--electric-blue)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        marginBottom: "0.35rem",
                        color: "#93C5FD",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <FileText size={16} /> Submit Solution for: {hw.title}
                    </div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Paste your Google Drive solution link or summarize your worked steps, formula derivations, and numerical answers.
                    </p>
                    <textarea
                      className="form-textarea"
                      placeholder="e.g. Solution Google Drive Link: https://drive.google.com/file/d/...&#10;Worked Summary: Maximum height H = 20.4 m, Range R = 70.7 m."
                      value={studentSubmissionText}
                      onChange={(e) => setStudentSubmissionText(e.target.value)}
                      rows={3}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "0.5rem",
                        marginTop: "0.75rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSubmittingHwId(null)}
                        className="btn btn-secondary btn-sm"
                        disabled={isSubmittingSolution}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStudentSubmit(hw._id)}
                        disabled={isSubmittingSolution}
                        className="btn btn-primary btn-sm"
                      >
                        {isSubmittingSolution ? (
                          "Saving to MongoDB..."
                        ) : (
                          <>
                            <Send size={13} /> Confirm Submission
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TEACHER "VIEW SUBMISSIONS" MODAL */}
      {viewingSubmissionsHw && (
        <div className="modal-overlay" onClick={handleCloseSubmissionsModal}>
          <div
            className="modal-content"
            style={{ maxWidth: "850px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.35rem",
                  }}
                >
                  <span className="badge badge-blue">{viewingSubmissionsHw.topic}</span>
                  <span className="badge badge-amber">
                    <Award size={12} /> {viewingSubmissionsHw.totalMarks} Marks
                  </span>
                </div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800 }}>
                  Submissions: {viewingSubmissionsHw.title}
                </h3>
              </div>
              <button onClick={handleCloseSubmissionsModal} className="btn btn-secondary btn-sm">
                <X size={16} />
              </button>
            </div>

            {loadingSubmissions ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                <Clock size={32} style={{ animation: "spin 1.5s linear infinite", margin: "0 auto 1rem auto" }} />
                <p>Loading enrolled student submissions from MongoDB Atlas...</p>
              </div>
            ) : (
              <div>
                {/* Metric Summary Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      background: "var(--secondary-navy)",
                      border: "1px solid var(--surface-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--electric-blue)" }}>
                      {totalEnrolled}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Enrolled Students
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--secondary-navy)",
                      border: "1px solid var(--surface-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--success-emerald)" }}>
                      {totalSubmitted}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Submissions Received
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--secondary-navy)",
                      border: "1px solid var(--surface-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--warning-amber)" }}>
                      {totalPending}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Pending Submissions
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--secondary-navy)",
                      border: "1px solid var(--surface-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--cyan-accent)" }}>
                      {submissionRate}%
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      Completion Rate
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      onClick={() => setRosterFilter("all")}
                      className={`btn btn-sm ${rosterFilter === "all" ? "btn-primary" : "btn-secondary"}`}
                    >
                      All ({totalEnrolled})
                    </button>
                    <button
                      onClick={() => setRosterFilter("submitted")}
                      className={`btn btn-sm ${rosterFilter === "submitted" ? "btn-primary" : "btn-secondary"}`}
                    >
                      Submitted ({totalSubmitted})
                    </button>
                    <button
                      onClick={() => setRosterFilter("pending")}
                      className={`btn btn-sm ${rosterFilter === "pending" ? "btn-primary" : "btn-secondary"}`}
                    >
                      Pending ({totalPending})
                    </button>
                  </div>

                  <div style={{ position: "relative", minWidth: "220px" }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search student..."
                      value={searchRosterQuery}
                      onChange={(e) => setSearchRosterQuery(e.target.value)}
                      style={{ paddingLeft: "2rem", fontSize: "0.85rem" }}
                    />
                    <Search
                      size={14}
                      color="var(--text-muted)"
                      style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
                    />
                  </div>
                </div>

                {/* Student Roster List */}
                {filteredRoster.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2.5rem 1rem",
                      background: "var(--secondary-navy)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Users size={32} style={{ margin: "0 auto 0.5rem auto", opacity: 0.4 }} />
                    <p>No students match the selected filter.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {filteredRoster.map((item) => (
                      <div
                        key={String(item.studentId)}
                        style={{
                          background: "var(--secondary-navy)",
                          border: `1px solid ${
                            item.submitted ? "rgba(16, 185, 129, 0.35)" : "var(--surface-border)"
                          }`,
                          borderRadius: "var(--radius-md)",
                          padding: "1rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                            marginBottom: item.submitted ? "0.75rem" : "0",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>
                                {item.studentName}
                              </h4>
                              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                ({item.studentEmail})
                              </span>
                              {item.batch && (
                                <span className="badge badge-blue" style={{ fontSize: "0.75rem" }}>
                                  {item.batch}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            {item.submitted ? (
                              <div style={{ textAlign: "right" }}>
                                <span className="badge badge-emerald">
                                  <CheckCircle2 size={12} /> Submitted
                                </span>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                                  {item.submission?.submittedAt
                                    ? new Date(item.submission.submittedAt).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "Recorded"}
                                </div>
                              </div>
                            ) : (
                              <span className="badge badge-amber">
                                <Clock size={12} /> Not Submitted
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Submitted Content Display */}
                        {item.submitted && item.submission && (
                          <div
                            style={{
                              background: "var(--surface-navy)",
                              border: "1px solid var(--surface-border-subtle)",
                              borderRadius: "var(--radius-sm)",
                              padding: "0.85rem 1rem",
                              fontSize: "0.88rem",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: "var(--text-muted)",
                                marginBottom: "0.35rem",
                              }}
                            >
                              Submitted Answer & Solution Note
                            </div>
                            <div style={{ whiteSpace: "pre-line", color: "var(--text-main)", lineHeight: 1.5 }}>
                              {item.submission.submissionText}
                            </div>

                            {item.submission.submissionLink && (
                              <div style={{ marginTop: "0.75rem" }}>
                                <a
                                  href={item.submission.submissionLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-primary btn-sm"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.35rem",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  <ExternalLink size={13} /> Open Solution Link (Google Drive)
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Homework Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.25rem" }}>
                {editingHw ? "Edit Physics Assignment" : "Assign Physics Homework"}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Assignment Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Circular Motion & Banked Roads Problem Set"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Physics Topic</label>
                  <select
                    className="form-input"
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

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Total Marks</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max="1000"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Submission Mode</label>
                  <select
                    className="form-input"
                    value={formData.submissionType}
                    onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
                  >
                    <option value="Online Submission">Online Submission</option>
                    <option value="Handwritten / In-Class">Handwritten / In-Class</option>
                    <option value="Worksheet">Worksheet</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Problem Instructions & Details *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Specify problem numbers, steps, or numerical questions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resource Attachment URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/homework/problem-set-01.pdf"
                  value={formData.resourceAttachment}
                  onChange={(e) => setFormData({ ...formData, resourceAttachment: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingHw ? "Update Assignment" : "Assign Homework"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
