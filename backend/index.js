require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB, getConnectionStatus } = require("./config/db");

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Base Route - Welcome & Health Check
app.get("/", (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    message: "Welcome to Physics LMS Backend API!",
    system: "Smart Learning Management System - Physics",
    status: "Online",
    version: "2.0.0",
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      configuredInEnv: dbStatus.isConfigured,
      host: dbStatus.host || "Local/In-Memory Cache",
      storageEngine: dbStatus.isConnected
        ? "MongoDB Atlas (Mongoose - Persistent)"
        : dbStatus.isConfigured
        ? "MongoDB Atlas (Disconnected - Check Network/Credentials)"
        : "Temporary In-Memory Storage (Add MONGO_URI to backend/.env for Atlas persistence)",
    },
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      lessons: "/api/lessons",
      studyMaterials: "/api/materials",
      homework: "/api/homework",
      quizzes: "/api/quizzes",
      students: "/api/students",
    },
  });
});

// Dedicated Health / Status check endpoint
app.get("/api/health", (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    server: "Running",
    database: dbStatus,
  });
});

// Mount API Routers
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/materials", require("./routes/materialRoutes"));
app.use("/api/homework", require("./routes/homeworkRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Physics LMS Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
