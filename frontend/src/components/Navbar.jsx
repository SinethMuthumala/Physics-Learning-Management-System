import React from "react";
import { Atom, BookOpen, FileText, CheckSquare, HelpCircle, LogOut, UserCheck, ShieldCheck, LogIn, UserPlus } from "lucide-react";

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
}) {
  return (
    <header style={{
      backgroundColor: "var(--surface-navy)",
      borderBottom: "1px solid var(--surface-border)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "var(--shadow-md)"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0.85rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap"
      }}>
        {/* Brand */}
        <div
          onClick={() => setActiveTab("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, var(--electric-blue), var(--cyan-accent))",
            width: "42px",
            height: "42px",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)"
          }}>
            <Atom size={26} color="#FFFFFF" />
          </div>
          <div>
            <div style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: "linear-gradient(90deg, #FFFFFF, #93C5FD)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              PHYSICS <span style={{ color: "var(--cyan-accent)", WebkitTextFillColor: "var(--cyan-accent)" }}>LMS</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Smart Learning Management System
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          overflowX: "auto",
          padding: "0.25rem 0"
        }}>
          <button
            onClick={() => setActiveTab("lessons")}
            className={`btn btn-sm ${activeTab === "lessons" ? "btn-primary" : "btn-secondary"}`}
          >
            <BookOpen size={16} /> Lessons
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`btn btn-sm ${activeTab === "materials" ? "btn-primary" : "btn-secondary"}`}
          >
            <FileText size={16} /> Study Materials
          </button>
          <button
            onClick={() => setActiveTab("homework")}
            className={`btn btn-sm ${activeTab === "homework" ? "btn-primary" : "btn-secondary"}`}
          >
            <CheckSquare size={16} /> Assignments
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`btn btn-sm ${activeTab === "quizzes" ? "btn-primary" : "btn-secondary"}`}
          >
            <HelpCircle size={16} /> Quizzes & MCQs
          </button>
          {user?.role === "teacher" && (
            <button
              onClick={() => setActiveTab("students")}
              className={`btn btn-sm ${activeTab === "students" ? "btn-primary" : "btn-secondary"}`}
            >
              <UserCheck size={16} /> Students
            </button>
          )}
        </nav>

        {/* User Account Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                  {user.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", justifyContent: "flex-end" }}>
                  <span className={`badge ${user.role === "teacher" ? "badge-amber" : "badge-cyan"}`}>
                    {user.role === "teacher" ? (
                      <><ShieldCheck size={11} /> Teacher</>
                    ) : (
                      <><UserCheck size={11} /> Student</>
                    )}
                  </span>
                  {user.batch && (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
                      {user.batch}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                title="Log out of account"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => onOpenAuth("login")}
                className="btn btn-secondary btn-sm"
              >
                <LogIn size={15} /> Sign In
              </button>
              <button
                onClick={() => onOpenAuth("register")}
                className="btn btn-primary btn-sm"
              >
                <UserPlus size={15} /> Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
