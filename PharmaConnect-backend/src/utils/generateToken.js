const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");

const generateToken = (user, type = "access") => {
  const expiresIn = type === "refresh" ? "7d" : "15m";
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, type },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

module.exports = generateToken;
