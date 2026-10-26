import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingHero from "./components/LandingHero";
import LessonCard from "./components/LessonCard";
import LessonFormModal from "./components/LessonFormModal";
import LessonDetailModal from "./components/LessonDetailModal";
import StudyMaterialsView from "./components/StudyMaterialsView";
import HomeworkView from "./components/HomeworkView";
import QuizView from "./components/QuizView";
import StudentManagementView from "./components/StudentManagementView";
import AuthModal from "./components/AuthModal";
import { api } from "./services/api";
import { Plus, Search, BookOpen, AlertCircle, CheckCircle, Sparkles } from "lucide-react";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // "home" | "lessons" | "materials" | "homework" | "quizzes" | "students"

  // Data states
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);

  // Filters & Search for lessons
  const [lessonTopicFilter, setLessonTopicFilter] = useState("All");
  const [lessonSearchTerm, setLessonSearchTerm] = useState("");

  // Modals
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState(null);
  const [selectedLessonForView, setSelectedLessonForView] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Notifications
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Restore authenticated session on load
  useEffect(() => {
    const savedUser = localStorage.getItem("physics_lms_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("physics_lms_user");
      }
    }
  }, []);

  // Fetch initial data from Express backend
  const loadData = async () => {
    try {
      setLoading(true);
      const [lData, mData, hData, qData, sStats] = await Promise.all([
        api.getLessons(),
        api.getMaterials(),
        api.getHomeworks(),
        api.getQuizzes(),
        api.getDashboardStats().catch(() => null),
      ]);

      setLessons(lData || []);
      setMaterials(mData || []);
      setHomeworks(hData || []);
      setQuizzes(qData || []);
      if (sStats) setStats(sStats);

      // If user is teacher or student, load results
      if (user?.role === "teacher") {
        const [allResults, studentList] = await Promise.all([
          api.getAllQuizResults().catch(() => []),
          api.getStudents().catch(() => []),
        ]);
        setQuizResults(allResults || []);
        setStudents(studentList || []);
      } else if (user) {
        const myResults = await api.getMyQuizResults().catch(() => []);
        setQuizResults(myResults || []);
      }
    } catch (err) {
      console.error("Error loading LMS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Auth Handlers
  const handleLogin = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem("physics_lms_token", data.token);
    localStorage.setItem("physics_lms_user", JSON.stringify(data));
    setUser(data);
    showToast(`Welcome back, ${data.name}!`);
  };

  const handleRegister = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem("physics_lms_token", data.token);
    localStorage.setItem("physics_lms_user", JSON.stringify(data));
    setUser(data);
    showToast(`Account created successfully! Welcome, ${data.name}.`);
  };

  const handleLogout = () => {
    localStorage.removeItem("physics_lms_token");
    localStorage.removeItem("physics_lms_user");
    setUser(null);
    setActiveTab("home");
    showToast("Logged out successfully.");
  };

  const handleQuickLogin = async (role) => {
    try {
      if (role === "teacher") {
        await handleLogin("teacher@physicslms.edu", "Password123!");
      } else {
        await handleLogin("student@physicslms.edu", "Password123!");
      }
      setActiveTab("lessons");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Lesson CRUD Operations
  const handleSaveLesson = async (lessonData, id) => {
    if (id) {
      const updated = await api.updateLesson(id, lessonData);
      setLessons(lessons.map((l) => (l._id === id ? updated : l)));
      showToast("Lesson updated successfully.");
    } else {
      const created = await api.createLesson(lessonData);
      setLessons([...lessons, created]);
      showToast("New lesson published successfully.");
    }
  };

  const handleDeleteLesson = async (lesson) => {
    if (window.confirm(`Are you sure you want to delete lesson "${lesson.title}"?`)) {
      try {
        await api.deleteLesson(lesson._id);
        setLessons(lessons.filter((l) => l._id !== lesson._id));
        showToast("Lesson deleted successfully.");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  };

  // Study Materials Handlers
  const handleAddMaterial = async (matData) => {
    const created = await api.createMaterial(matData);
    setMaterials([created, ...materials]);
    showToast("Study material added successfully.");
  };

  const handleUpdateMaterial = async (id, matData) => {
    const updated = await api.updateMaterial(id, matData);
    setMaterials(materials.map((m) => (m._id === id ? updated : m)));
    showToast("Study material updated successfully.");
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm("Delete this study resource?")) {
      try {
        await api.deleteMaterial(id);
        setMaterials(materials.filter((m) => m._id !== id));
        showToast("Material removed successfully.");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  };

  // Homework Handlers
  const handleAddHomework = async (hwData) => {
    const created = await api.createHomework(hwData);
    setHomeworks([...homeworks, created]);
    showToast("Homework problem set assigned successfully.");
  };

  const handleUpdateHomework = async (id, hwData) => {
    const updated = await api.updateHomework(id, hwData);
    setHomeworks(homeworks.map((h) => (h._id === id ? updated : h)));
    showToast("Homework assignment updated successfully.");
  };

  const handleDeleteHomework = async (id) => {
    if (window.confirm("Delete this homework assignment?")) {
      try {
        await api.deleteHomework(id);
        setHomeworks(homeworks.filter((h) => h._id !== id));
        showToast("Homework removed successfully.");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  };

  const handleRefreshHomeworks = async () => {
    try {
      const hData = await api.getHomeworks();
      setHomeworks(hData || []);
    } catch (err) {
      console.error("Error refreshing homeworks:", err);
    }
  };

  // Quiz Handlers
  const handleAddQuiz = async (quizData) => {
    const created = await api.createQuiz(quizData);
    setQuizzes([created, ...quizzes]);
    showToast("Quiz assessment published successfully.");
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm("Delete this quiz?")) {
      try {
        await api.deleteQuiz(id);
        setQuizzes(quizzes.filter((q) => q._id !== id));
        showToast("Quiz deleted successfully.");
      } catch (err) {
        showToast(err.message, "error");
      }
    }
  };

  const handleSubmitQuiz = async (quizId, submissionData) => {
    const result = await api.submitQuiz(quizId, submissionData);
    // Refresh results list
    if (user?.role === "teacher") {
      const allResults = await api.getAllQuizResults().catch(() => []);
      setQuizResults(allResults);
    } else {
      const myResults = await api.getMyQuizResults().catch(() => []);
      setQuizResults(myResults);
    }
    return result;
  };

  // Filter lessons
  const filteredLessons = lessons.filter((l) => {
    const matchesTopic = lessonTopicFilter === "All" || l.topic === lessonTopicFilter;
    const matchesSearch =
      l.title.toLowerCase().includes(lessonSearchTerm.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(lessonSearchTerm.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  const topics = ["All", "Mechanics", "Electricity & Magnetism", "Waves & Optics", "Thermal Physics", "Modern Physics", "General Physics"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          background: toast.type === "error" ? "var(--danger-rose)" : "var(--success-emerald)",
          color: "#FFFFFF",
          padding: "0.85rem 1.25rem",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          boxShadow: "var(--shadow-lg)",
          fontSize: "0.9rem",
          fontWeight: 600,
          animation: "slideUp 0.2s ease-out"
        }}>
          {toast.type === "error" ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="main-content">
        {/* LANDING / HOME VIEW */}
        {activeTab === "home" && (
          <LandingHero
            stats={stats}
            onExplore={(tab) => setActiveTab(tab)}
            onQuickLogin={handleQuickLogin}
          />
        )}

        {/* LESSONS VIEW */}
        {activeTab === "lessons" && (
          <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Physics Lessons & Modules</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Systematic concept breakdown covering theory, diagrams, and derivation techniques
                </p>
              </div>

              {user?.role === "teacher" && (
                <button
                  onClick={() => {
                    setLessonToEdit(null);
                    setShowLessonForm(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus size={16} /> Create New Lesson
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
              {/* Search Bar */}
              <div style={{ position: "relative" }}>
                <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "2.75rem" }}
                  placeholder="Search physics lessons (e.g. Mechanics, Superposition, Kirchhoff, Projectile)..."
                  value={lessonSearchTerm}
                  onChange={(e) => setLessonSearchTerm(e.target.value)}
                />
              </div>

              {/* Topic Filters */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setLessonTopicFilter(t)}
                    className={`btn btn-sm ${lessonTopicFilter === t ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Lessons Grid */}
            {filteredLessons.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                <BookOpen size={40} style={{ margin: "0 auto 1rem auto", opacity: 0.4 }} />
                <h3>No lessons match your filter</h3>
                <p style={{ fontSize: "0.9rem" }}>Try clearing search keywords or selecting "All" topics.</p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem"
              }}>
                {filteredLessons.map((lesson) => (
                  <LessonCard
                    key={lesson._id}
                    lesson={lesson}
                    isTeacher={user?.role === "teacher"}
                    onView={(l) => setSelectedLessonForView(l)}
                    onEdit={(l) => {
                      setLessonToEdit(l);
                      setShowLessonForm(true);
                    }}
                    onDelete={handleDeleteLesson}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* STUDY MATERIALS VIEW */}
        {activeTab === "materials" && (
          <StudyMaterialsView
            materials={materials}
            isTeacher={user?.role === "teacher"}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        )}

        {/* HOMEWORK VIEW */}
        {activeTab === "homework" && (
          <HomeworkView
            homeworks={homeworks}
            isTeacher={user?.role === "teacher"}
            user={user}
            onAddHomework={handleAddHomework}
            onUpdateHomework={handleUpdateHomework}
            onDeleteHomework={handleDeleteHomework}
            onRefreshHomeworks={handleRefreshHomeworks}
          />
        )}

        {/* QUIZZES VIEW */}
        {activeTab === "quizzes" && (
          <QuizView
            quizzes={quizzes}
            quizResults={quizResults}
            isTeacher={user?.role === "teacher"}
            user={user}
            onAddQuiz={handleAddQuiz}
            onDeleteQuiz={handleDeleteQuiz}
            onSubmitQuiz={handleSubmitQuiz}
          />
        )}

        {/* STUDENTS VIEW (Teacher only) */}
        {activeTab === "students" && user?.role === "teacher" && (
          <StudentManagementView students={students} />
        )}
      </main>

      {/* Lesson Detail Modal */}
      <LessonDetailModal
        lesson={selectedLessonForView}
        isOpen={!!selectedLessonForView}
        onClose={() => setSelectedLessonForView(null)}
        onNavigateQuiz={() => setActiveTab("quizzes")}
      />

      {/* Lesson Form Modal (Create / Edit) */}
      <LessonFormModal
        isOpen={showLessonForm}
        lessonToEdit={lessonToEdit}
        onClose={() => {
          setShowLessonForm(false);
          setLessonToEdit(null);
        }}
        onSave={handleSaveLesson}
      />

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authMode}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Footer */}
      <footer style={{
        marginTop: "auto",
        borderTop: "1px solid var(--surface-border)",
        background: "var(--surface-navy)",
        padding: "1.5rem",
        textAlign: "center",
        fontSize: "0.85rem",
        color: "var(--text-dim)"
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <strong>Physics LMS</strong> &bull; University Mini Project &copy; {new Date().getFullYear()}
          </div>
          <div>
            Built with MERN Stack (MongoDB Atlas, Express.js, React.js, Node.js)
          </div>
        </div>
      </footer>
    </div>
  );
}
