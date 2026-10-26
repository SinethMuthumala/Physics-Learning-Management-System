// API Service Client for Physics LMS
const API_BASE = "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("physics_lms_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Lessons
  async getLessons(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE}/lessons${query ? `?${query}` : ""}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getLessonById(id) {
    const res = await fetch(`${API_BASE}/lessons/${id}`);
    return handleResponse(res);
  },

  async createLesson(lessonData) {
    const res = await fetch(`${API_BASE}/lessons`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonData),
    });
    return handleResponse(res);
  },

  async updateLesson(id, lessonData) {
    const res = await fetch(`${API_BASE}/lessons/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonData),
    });
    return handleResponse(res);
  },

  async deleteLesson(id) {
    const res = await fetch(`${API_BASE}/lessons/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Study Materials
  async getMaterials(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/materials${query ? `?${query}` : ""}`);
    return handleResponse(res);
  },

  async createMaterial(materialData) {
    const res = await fetch(`${API_BASE}/materials`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(materialData),
    });
    return handleResponse(res);
  },

  async updateMaterial(id, materialData) {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(materialData),
    });
    return handleResponse(res);
  },

  async deleteMaterial(id) {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Homework
  async getHomeworks(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/homework${query ? `?${query}` : ""}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createHomework(hwData) {
    const res = await fetch(`${API_BASE}/homework`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(hwData),
    });
    return handleResponse(res);
  },

  async updateHomework(id, hwData) {
    const res = await fetch(`${API_BASE}/homework/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(hwData),
    });
    return handleResponse(res);
  },

  async deleteHomework(id) {
    const res = await fetch(`${API_BASE}/homework/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitHomework(id, submissionData) {
    const res = await fetch(`${API_BASE}/homework/${id}/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(submissionData),
    });
    return handleResponse(res);
  },

  async getHomeworkSubmissions(id) {
    const res = await fetch(`${API_BASE}/homework/${id}/submissions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getMyHomeworkSubmissions() {
    const res = await fetch(`${API_BASE}/homework/my-submissions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Quizzes
  async getQuizzes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/quizzes${query ? `?${query}` : ""}`);
    return handleResponse(res);
  },

  async getQuizById(id) {
    const res = await fetch(`${API_BASE}/quizzes/${id}`);
    return handleResponse(res);
  },

  async createQuiz(quizData) {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData),
    });
    return handleResponse(res);
  },

  async deleteQuiz(id) {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitQuiz(id, submissionData) {
    const res = await fetch(`${API_BASE}/quizzes/${id}/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(submissionData),
    });
    return handleResponse(res);
  },

  async getAllQuizResults() {
    const res = await fetch(`${API_BASE}/quizzes/results`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getMyQuizResults() {
    const res = await fetch(`${API_BASE}/quizzes/my-results`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Students & Stats
  async getStudents() {
    const res = await fetch(`${API_BASE}/students`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/students/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

export default api;
