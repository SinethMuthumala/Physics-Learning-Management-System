const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getJwtSecret = () => process.env.JWT_SECRET || "physics_lms_default_secret_key_2026";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, getJwtSecret());

      // Attempt to load from MongoDB
      req.user = await User.findById(decoded.id).select("-password");

      // In case user was demo or offline
      if (!req.user && decoded.id) {
        if (decoded.id === "660000000000000000000001" || decoded.role === "teacher") {
          req.user = {
            _id: decoded.id,
            name: "Dr. Gamini Senanayake",
            email: "teacher@physicslms.edu",
            role: "teacher",
          };
        } else {
          req.user = {
            _id: decoded.id,
            name: decoded.name || "Student",
            email: decoded.email || "student@physicslms.edu",
            role: "student",
          };
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: "User account not found" });
      }

      return next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);
      return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

const teacherOnly = (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    next();
  } else {
    res.status(403).json({ message: "Access forbidden: Teacher privilege required" });
  }
};

const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    next();
  } else {
    res.status(403).json({ message: "Access forbidden: Student privilege required" });
  }
};

module.exports = { protect, teacherOnly, studentOnly, getJwtSecret };
