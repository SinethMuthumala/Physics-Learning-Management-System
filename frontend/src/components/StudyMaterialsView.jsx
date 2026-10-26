import React, { useState } from "react";
import { FileText, Download, Plus, Trash2, Edit3, ExternalLink, Search, X, Save } from "lucide-react";

export default function StudyMaterialsView({
  materials,
  isTeacher,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    topic: "Mechanics",
    resourceType: "PDF Document",
    resourceUrl: "",
    description: "",
    fileSize: "1.8 MB",
  });
  const [submitting, setSubmitting] = useState(false);

  const topics = ["All", "Mechanics", "Electricity & Magnetism", "Waves & Optics", "Thermal Physics", "Modern Physics", "General Physics"];

  const filteredMaterials = materials.filter((m) => {
    const matchesTopic = selectedTopic === "All" || m.topic === selectedTopic;
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setFormData({
      title: "",
      topic: "Mechanics",
      resourceType: "PDF Document",
      resourceUrl: "",
      description: "",
      fileSize: "1.8 MB",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title || "",
      topic: material.topic || "Mechanics",
      resourceType: material.resourceType || "PDF Document",
      resourceUrl: material.resourceUrl || "",
      description: material.description || "",
      fileSize: material.fileSize || "1.8 MB",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.resourceUrl) return;
    try {
      setSubmitting(true);
      if (editingMaterial) {
        if (onUpdateMaterial) {
          await onUpdateMaterial(editingMaterial._id, formData);
        }
      } else {
        await onAddMaterial(formData);
      }
      setShowModal(false);
      setEditingMaterial(null);
    } catch (err) {
      alert("Error saving study material: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Physics Study Materials & Resources</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Curated lecture notes, formula sheets, derivations, and reference guides
          </p>
        </div>
        {isTeacher && (
          <button onClick={handleOpenCreate} className="btn btn-primary">
            <Plus size={16} /> Add Study Material
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: "var(--surface-navy)",
        border: "1px solid var(--surface-border)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Search notes, formulas, topics (e.g. Kirchhoff, Doppler, Kinematics)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Topic Filter Pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`btn btn-sm ${selectedTopic === t ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.8rem" }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          <FileText size={40} style={{ margin: "0 auto 1rem auto", opacity: 0.4 }} />
          <h3>No study materials found</h3>
          <p style={{ fontSize: "0.9rem" }}>Try adjusting your search query or topic filter.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem"
        }}>
          {filteredMaterials.map((item) => (
            <div key={item._id} className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <span className="badge badge-blue">{item.topic}</span>
                <span className="badge badge-cyan">{item.resourceType}</span>
              </div>

              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                {item.title}
              </h4>

              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", flex: 1, marginBottom: "1rem" }}>
                {item.description || "High-yield reference material for tuition class review."}
              </p>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid var(--surface-border-subtle)",
                paddingTop: "0.75rem",
                marginTop: "auto"
              }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                  Size: {item.fileSize || "1.5 MB"}
                </span>

                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <a
                    href={item.resourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    <ExternalLink size={14} /> Open
                  </a>

                  {isTeacher && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Study Material"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteMaterial(item._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: "var(--danger-rose)" }}
                        title="Delete Material"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Study Material Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.25rem" }}>
                {editingMaterial ? "Edit Physics Resource" : "Add New Physics Resource"}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Resource Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Electromagnetic Induction Formulas & Summary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Physics Topic</label>
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
                  <label className="form-label">Material Type</label>
                  <select
                    className="form-select"
                    value={formData.resourceType}
                    onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                  >
                    <option value="PDF Document">PDF Document</option>
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Formula Sheet">Formula Sheet</option>
                    <option value="Slides">Slides</option>
                    <option value="External Link">External Link</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Resource Document / Web Link *</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://drive.google.com/... or https://..."
                  value={formData.resourceUrl}
                  onChange={(e) => setFormData({ ...formData, resourceUrl: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brief Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Overview of the key contents, formulas, or derivations included..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  <Save size={15} /> {submitting ? "Saving..." : editingMaterial ? "Update Material" : "Save Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
