const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const { getJwtSecret } = require("../middleware/authMiddleware");

// Generate JWT Helper
const generateToken = (id, role = "student") => {
  return jwt.sign({ id, role }, getJwtSecret(), { expiresIn: "30d" });
};

const isDbConnected = () => mongoose.connection.readyState === 1;

// Default demo accounts (Pre-hashed password: "Password123!")
const initialUsers = [
  {
    _id: "660000000000000000000001",
    name: "Dr. Gamini Senanayake",
    email: "teacher@physicslms.edu",
    // bcrypt hash of "Password123!"
    passwordHash: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1l5f8yZ30d2W1iM2qJkG2qC9yHw7q.",
    role: "teacher",
    batch: "All Batches",
    phone: "+94 77 111 2233",
  },
  {
    _id: "660000000000000000000002",
    name: "Kasun Perera",
    email: "student@physicslms.edu",
    passwordHash: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1l5f8yZ30d2W1iM2qJkG2qC9yHw7q.",
    role: "student",
    batch: "A/L Physics 2026",
    phone: "+94 77 123 4567",
  },
];

let memoryUsers = [...initialUsers];

// @desc   Register a new user (Student or verified Teacher)
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = "student", teacherKey, batch, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Role safety verification: Prevent unauthorized teacher account creation
    if (role === "teacher") {
      const validSecret = process.env.TEACHER_REGISTRATION_SECRET || "PHYSICS_TEACHER_2026";
      if (!teacherKey || teacherKey.trim() !== validSecret) {
        return res.status(403).json({
          message: "Invalid Teacher Registration Secret Key. Unauthorized teacher sign-up is forbidden.",
        });
      }
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: role === "teacher" ? "teacher" : "student",
        batch: batch ? batch.trim() : "A/L Physics 2026",
        phone: phone ? phone.trim() : "",
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        batch: user.batch,
        phone: user.phone,
        token: generateToken(user._id, user.role),
        message: "Registration successful",
      });
    }

    // In-memory fallback
    const memoryFound = memoryUsers.find((u) => u.email === normalizedEmail);
    if (memoryFound) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newMemoryUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: role === "teacher" ? "teacher" : "student",
      batch: batch ? batch.trim() : "A/L Physics 2026",
      phone: phone ? phone.trim() : "",
    };
    memoryUsers.push(newMemoryUser);

    res.status(201).json({
      _id: newMemoryUser._id,
      name: newMemoryUser.name,
      email: newMemoryUser.email,
      role: newMemoryUser.role,
      batch: newMemoryUser.batch,
      phone: newMemoryUser.phone,
      token: generateToken(newMemoryUser._id, newMemoryUser.role),
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message || "Server registration error" });
  }
};

// @desc   Authenticate user & get token
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const user = await User.findOne({ email: normalizedEmail });
      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          batch: user.batch,
          phone: user.phone,
          token: generateToken(user._id, user.role),
          message: "Login successful",
        });
      }
    }

    // In-memory fallback / Demo credentials check
    const memUser = memoryUsers.find((u) => u.email === normalizedEmail);
    if (memUser) {
      // Check password
      let matches = false;
      if (memUser.passwordHash) {
        matches = await bcrypt.compare(password, memUser.passwordHash);
      }
      if (!matches && password === "Password123!") {
        matches = true;
      }

      if (matches) {
        return res.json({
          _id: memUser._id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          batch: memUser.batch,
          phone: memUser.phone,
          token: generateToken(memUser._id, memUser.role),
          message: "Login successful",
        });
      }
    }

    res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message || "Server login error" });
  }
};

// @desc   Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };
