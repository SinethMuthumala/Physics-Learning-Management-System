const mongoose = require("mongoose");

// Mask URI credentials in error messages for security
const sanitizeMessage = (msg) => {
  if (!msg || typeof msg !== "string") return msg;
  return msg.replace(/\/\/[^:]+:[^@]+@/g, "//***:***@");
};

const getConnectionStatus = () => {
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const readyState = mongoose.connection.readyState;
  return {
    state: stateMap[readyState] || "unknown",
    isConnected: readyState === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    isConfigured: Boolean(process.env.MONGO_URI && process.env.MONGO_URI.trim() !== ""),
  };
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === "") {
    console.warn("⚠️ MONGO_URI is not set in backend/.env. Running in temporary offline in-memory mode.");
    return null;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Atlas Connected Successfully: Host = ${conn.connection.host}, Database = ${conn.connection.name}`);
    return conn;
  } catch (error) {
    const safeError = sanitizeMessage(error.message);
    console.error(`❌ MongoDB Atlas Connection Error: ${safeError}`);
    console.error("👉 Please verify: 1) MongoDB Atlas username & password, 2) IP Access List (0.0.0.0/0 allowed), 3) Database name in MONGO_URI.");
    return null;
  }
};

module.exports = { connectDB, getConnectionStatus, sanitizeMessage };
