import React, { useState } from "react";
import { X, LogIn, UserPlus, ShieldCheck, UserCheck, Key, Lock, Mail, User, Phone, BookOpen } from "lucide-react";

export default function AuthModal({
  isOpen,
  initialMode = "login", // "login" or "register"
  onClose,
  onLogin,
  onRegister,
}) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState("student"); // "student" or "teacher"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    batch: "A/L Physics 2026",
    phone: "",
    teacherKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      if (mode === "login") {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister({
          ...formData,
          role,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setError("");
    setLoading(true);
    try {
      if (demoRole === "teacher") {
        await onLogin("teacher@physicslms.edu", "Password123!");
      } else {
        await onLogin("student@physicslms.edu", "Password123!");
      }
      onClose();
    } catch (err) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.4rem" }}>
              {mode === "login" ? "Sign In to Physics LMS" : "Create Student Account"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              {mode === "login"
                ? "Enter your registered email and password to access your dashboard"
                : "Join your university or tuition physics cohort"}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            <X size={16} />
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div style={{
          background: "var(--secondary-navy)",
          border: "1px solid var(--surface-border)",
          borderRadius: "var(--radius-md)",
          padding: "0.85rem 1rem",
          marginBottom: "1.25rem"
        }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--cyan-accent)", marginBottom: "0.5rem" }}>
            ⚡ 1-Click Evaluation Login:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => handleQuickDemo("teacher")}
              className="btn btn-sm btn-secondary"
              style={{ borderColor: "var(--warning-amber)", color: "#FBBF24", fontSize: "0.78rem" }}
            >
              <ShieldCheck size={13} /> Demo Teacher
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("student")}
              className="btn btn-sm btn-secondary"
              style={{ borderColor: "var(--cyan-accent)", color: "#22D3EE", fontSize: "0.78rem" }}
            >
              <UserCheck size={13} /> Demo Student
            </button>
          </div>
        </div>

        {/* Tab switch between Sign In and Register */}
        <div style={{
          display: "flex",
          background: "var(--primary-navy)",
          padding: "0.3rem",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.25rem"
        }}>
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "var(--radius-sm)",
              border: 0,
              background: mode === "login" ? "var(--electric-blue)" : "transparent",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "var(--radius-sm)",
              border: 0,
              background: mode === "register" ? "var(--electric-blue)" : "transparent",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Register
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
          {mode === "register" && (
            <>
              {/* Role selection */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`btn btn-sm ${role === "student" ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "0.8rem" }}
                >
                  <UserCheck size={14} /> Student Account
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`btn btn-sm ${role === "teacher" ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "0.8rem" }}
                >
                  <ShieldCheck size={14} /> Teacher Account
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="e.g. Kasun Perera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {role === "student" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Tuition Batch</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="A/L Physics 2026"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+94 77 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Secret key check if teacher */}
              {role === "teacher" && (
                <div className="form-group" style={{ background: "rgba(245, 158, 11, 0.1)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                  <label className="form-label" style={{ color: "#FBBF24" }}>
                    Teacher Registration Secret Key *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Key size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--warning-amber)" }} />
                    <input
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: "2.5rem" }}
                      placeholder="Enter verification secret key (Default: PHYSICS_TEACHER_2026)"
                      value={formData.teacherKey}
                      onChange={(e) => setFormData({ ...formData, teacherKey: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.3rem" }}>
                    Required to prevent unauthorized student elevation to teacher.
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="name@physicslms.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}
          >
            {loading ? "Processing..." : mode === "login" ? "Sign In" : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}
