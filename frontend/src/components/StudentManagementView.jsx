import React, { useState } from "react";
import { Users, Search, Phone, Mail, Award, CheckCircle } from "lucide-react";

export default function StudentManagementView({ students }) {
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.batch && s.batch.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Student Directory & Tuition Records</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Track enrolled students, tuition batches, contact information, and academic assessment performance
          </p>
        </div>
      </div>

      {/* Search and Summary */}
      <div style={{
        background: "var(--surface-navy)",
        border: "1px solid var(--surface-border)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem",
        marginBottom: "1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Search student by name, email, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.88rem" }}>
            <Users size={16} color="var(--electric-blue)" /> Total Students: <strong>{students.length}</strong>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
            <Users size={40} style={{ margin: "0 auto 1rem auto", opacity: 0.4 }} />
            <h3>No students found</h3>
            <p style={{ fontSize: "0.9rem" }}>Try searching with a different name or batch filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "var(--secondary-navy)", borderBottom: "1px solid var(--surface-border)" }}>
                  <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Student Details</th>
                  <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Enrolled Batch</th>
                  <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Contact Info</th>
                  <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Quizzes Taken</th>
                  <th style={{ padding: "0.85rem 1rem", color: "var(--text-muted)" }}>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--surface-border-subtle)" }}>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ fontWeight: 700, color: "var(--text-main)" }}>{s.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Mail size={12} /> {s.email}
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span className="badge badge-cyan">{s.batch || "A/L Physics 2026"}</span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {s.phone ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Phone size={13} color="var(--success-emerald)" /> {s.phone}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-dim)" }}>Not specified</span>
                      )}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 600 }}>
                      {s.quizzesTaken || 0} Attempts
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span className={`badge ${(s.averageQuizScore || 0) >= 60 ? "badge-emerald" : "badge-amber"}`}>
                        <Award size={12} /> {s.averageQuizScore || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
