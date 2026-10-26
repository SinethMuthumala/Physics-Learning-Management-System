import React from "react";
import { Atom, Compass, Zap, Flame, Radio, Award, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export default function LandingHero({ onExplore, onQuickLogin, stats }) {
  const topics = [
    { title: "Mechanics", icon: <Compass size={22} color="#60A5FA" />, desc: "Kinematics, Newton's Laws, Dynamics, Energy & Momentum Conservation" },
    { title: "Electricity & Magnetism", icon: <Zap size={22} color="#FBBF24" />, desc: "Electric Fields, DC Circuit Analysis, Gauss's Law & Induction" },
    { title: "Waves & Optics", icon: <Radio size={22} color="#34D399" />, desc: "Superposition, Doppler Effect, Resonance, Wave Optics & Refraction" },
    { title: "Thermal & Modern", icon: <Flame size={22} color="#F87171" />, desc: "Thermodynamics, Photoelectric Effect, Quantum & Nuclear Physics" },
  ];

  return (
    <div style={{ paddingBottom: "2rem" }}>
      {/* Hero Banner */}
      <div style={{
        background: "radial-gradient(ellipse at top, #1E3A8A 0%, var(--surface-navy) 60%, var(--primary-navy) 100%)",
        border: "1px solid var(--surface-border)",
        borderRadius: "var(--radius-lg)",
        padding: "3.5rem 2rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-lg)",
        marginBottom: "2.5rem"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(59, 130, 246, 0.15)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          padding: "0.35rem 1rem",
          borderRadius: "var(--radius-full)",
          fontSize: "0.85rem",
          color: "#93C5FD",
          fontWeight: 600,
          marginBottom: "1.25rem"
        }}>
          <Atom size={18} className="spin-slow" /> University Mini-Project & Real Tuition LMS
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 4vw, 3.2rem)",
          fontWeight: 800,
          maxWidth: "850px",
          margin: "0 auto 1.25rem auto",
          letterSpacing: "-0.03em"
        }}>
          Master Advanced Physics with <span style={{
            background: "linear-gradient(90deg, #60A5FA, #22D3EE)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Interactive Concept-First</span> Learning
        </h1>

        <p style={{
          fontSize: "1.1rem",
          color: "var(--text-muted)",
          maxWidth: "680px",
          margin: "0 auto 2rem auto"
        }}>
          Comprehensive Physics Learning Management System engineered with the MERN stack.
          Organize syllabus lessons, access structured study resources, manage homework, and evaluate mastery with interactive MCQ assessments.
        </p>

        {/* Action CTAs */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "2.5rem"
        }}>
          <button onClick={() => onExplore("lessons")} className="btn btn-primary" style={{ padding: "0.85rem 1.85rem", fontSize: "1rem" }}>
            Explore Physics Lessons <ArrowRight size={18} />
          </button>
          <button onClick={() => onExplore("quizzes")} className="btn btn-secondary" style={{ padding: "0.85rem 1.85rem", fontSize: "1rem" }}>
            Take Practice Quiz
          </button>
        </div>

        {/* Instant 1-Click Evaluation Login Bar */}
        <div style={{
          background: "rgba(15, 23, 42, 0.75)",
          border: "1px solid var(--surface-border)",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.5rem",
          maxWidth: "720px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem"
        }}>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
              ⚡ University Evaluation Quick Access:
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              One-click testing with pre-configured role permissions
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => onQuickLogin("teacher")}
              className="btn btn-sm btn-secondary"
              style={{ borderColor: "var(--warning-amber)", color: "#FBBF24" }}
            >
              <ShieldCheck size={14} /> Teacher Portal
            </button>
            <button
              onClick={() => onQuickLogin("student")}
              className="btn btn-sm btn-secondary"
              style={{ borderColor: "var(--cyan-accent)", color: "#22D3EE" }}
            >
              <UserCheck size={14} /> Student Portal
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Counter Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2.5rem"
      }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--electric-blue)" }}>
            {stats?.totalLessons || 3}+
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
            Structured Physics Lessons
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--cyan-accent)" }}>
            {stats?.totalMaterials || 4}+
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
            Formula Sheets & Notes
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--warning-amber)" }}>
            {stats?.totalHomework || 3}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
            Assignments & Problem Sets
          </div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--success-emerald)" }}>
            {stats?.averageScore || 85}%
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
            Class Average Quiz Score
          </div>
        </div>
      </div>

      {/* Physics Syllabus Core Pillars */}
      <div>
        <div style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Core Physics Curriculum</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Aligned with G.C.E. Advanced Level Physics specifications
            </p>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem"
        }}>
          {topics.map((t, idx) => (
            <div key={idx} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{
                background: "var(--surface-navy)",
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--surface-border)"
              }}>
                {t.icon}
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>{t.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", flex: 1 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
