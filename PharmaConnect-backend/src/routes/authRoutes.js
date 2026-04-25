const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const User = require("../models/Users");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Rate limiter: 50 attempts per 15 minutes (dev mode)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 50,
  message: { message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
router.post("/register",
  validate({
    name:     { required: true, minLength: 2 },
    email:    { required: true, email: true },
    password: { required: true, minLength: 6 },
  }),
  async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    const accessToken = generateToken(user, "access");
    const refreshToken = generateToken(user, "refresh");

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login",
  // loginLimiter, // Disabled for development
  validate({
    email:    { required: true, email: true },
    password: { required: true },
  }),
  async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateToken(user, "access");
    const refreshToken = generateToken(user, "refresh");

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== "refresh")
      return res.status(401).json({ message: "Invalid token type" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const accessToken = generateToken(user, "access");

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    });

    res.json({ message: "Token refreshed" });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me (protected)
router.get("/me", protect, (req, res) => res.json(req.user));

// PATCH /api/auth/change-password (protected)
router.patch("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both current and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
