import React from "react";
import { X, Clock, BarChart2, Video, ExternalLink, BookOpen, CheckCircle, AlertTriangle, Play } from "lucide-react";
import { extractYouTubeId, getYouTubeEmbedUrl, getCanonicalWatchUrl } from "../utils/videoHelper";

export default function LessonDetailModal({ lesson, isOpen, onClose, onNavigateQuiz }) {
  if (!isOpen || !lesson) return null;

  const rawUrl = lesson.videoUrl ? lesson.videoUrl.trim() : "";
  const youtubeId = extractYouTubeId(rawUrl);
  const embedUrl = getYouTubeEmbedUrl(rawUrl);
  const watchUrl = getCanonicalWatchUrl(rawUrl);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: "0.4rem" }}>
              {lesson.topic}
            </span>
            <h2 style={{ fontSize: "1.4rem" }}>{lesson.title}</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.5rem" }}>
            <X size={18} />
          </button>
        </div>

        {/* Lesson Metadata */}
        <div style={{
          display: "flex",
          gap: "1.25rem",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          padding: "0.75rem",
          background: "var(--secondary-navy)",
          borderRadius: "var(--radius-md)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Clock size={15} color="var(--electric-blue)" /> {lesson.durationMinutes || 60} Minutes
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <BarChart2 size={15} color="var(--cyan-accent)" /> Level: {lesson.difficulty || "Intermediate"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <CheckCircle size={15} color="var(--success-emerald)" /> Status: {lesson.status || "Published"}
          </div>
        </div>

        {/* Video Player Section */}
        {embedUrl ? (
          <div style={{ marginBottom: "1.5rem" }}>
            {/* 16:9 Aspect Ratio Responsive Wrapper */}
            <div style={{
              position: "relative",
              paddingBottom: "56.25%", // 16:9 ratio
              height: 0,
              overflow: "hidden",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--surface-border)",
              backgroundColor: "#000000"
            }}>
              <iframe
                src={embedUrl}
                title={lesson.title}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {/* Video Controls & External Fallback Bar */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "0.6rem",
              padding: "0.6rem 0.85rem",
              background: "var(--secondary-navy)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--surface-border-subtle)",
              fontSize: "0.8rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
                <span className="badge badge-blue" style={{ fontSize: "0.7rem" }}>YouTube</span>
                <span>Video ID: <code style={{ color: "#93C5FD", fontFamily: "var(--font-mono)" }}>{youtubeId}</code></span>
              </div>

              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: "0.8rem",
                  borderColor: "rgba(239, 68, 68, 0.4)",
                  color: "#FCA5A5",
                  background: "rgba(239, 68, 68, 0.1)"
                }}
              >
                <Play size={13} fill="#EF4444" color="#EF4444" /> Open in YouTube <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ) : rawUrl ? (
          /* Non-YouTube or Unparseable External Video Link */
          <div style={{
            background: "var(--secondary-navy)",
            border: "1px solid var(--surface-border)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                background: "rgba(59, 130, 246, 0.15)",
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Video size={22} color="var(--electric-blue)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>External Video Resource</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  This video URL is hosted externally and opens directly in a dedicated tab.
                </div>
              </div>
            </div>

            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              Open External Video <ExternalLink size={14} />
            </a>
          </div>
        ) : (
          /* Missing Video URL */
          <div style={{
            background: "var(--surface-navy)",
            border: "1px dashed var(--surface-border)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: "0.88rem",
            marginBottom: "1.5rem"
          }}>
            <Video size={32} style={{ margin: "0 auto 0.5rem auto", opacity: 0.5 }} />
            No video recording linked for this lesson yet. Review the syllabus notes below.
          </div>
        )}

        {/* Detailed Concept Syllabus */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "1rem", marginBottom: "0.6rem", color: "#93C5FD" }}>
            Syllabus Coverage & Theory Outline
          </h4>
          <div style={{
            background: "var(--secondary-navy)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.9rem",
            lineHeight: 1.7,
            color: "var(--text-main)",
            whiteSpace: "pre-line"
          }}>
            {lesson.description || "In-depth Physics syllabus breakdown covering fundamental laws, dimensional equations, graphical interpretations, and sample worked problems."}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--surface-border)", paddingTop: "1rem" }}>
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              if (onNavigateQuiz) onNavigateQuiz();
            }}
            className="btn btn-primary"
          >
            Practice Topic Quizzes &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
