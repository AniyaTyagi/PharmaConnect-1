const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const protect = async (req, res, next) => {
  const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
  
  if (!token)
    return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch fresh user data including current role
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    
    req.user = { id: user._id, email: user.email, role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: "Access denied" });
  next();
};

module.exports = { protect, authorizeRoles };
