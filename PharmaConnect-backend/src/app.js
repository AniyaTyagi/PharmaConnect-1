require("dotenv").config({ path: require("path").resolve(__dirname, "../.env"), override: true });
const { GoogleGenerativeAI } = require("@google/generative-ai");


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const redisClient = require("./config/redis");

const app = express();

// =======================
// 🔹 Middleware
// =======================
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

// =======================
// 🔹 MongoDB Connection
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error:", err.message));

// =======================
// 🔹 Routes Imports
// =======================
const authRoutes = require("./routes/authRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

// =======================
// 🔹 Models
// =======================

// =======================
// 🔹 Use Routes
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/invoices", invoiceRoutes);

// =======================
// 🔹 Home Route
// =======================
app.get("/", (req, res) => res.send("API Running 🚀"));

// =======================
// 🔹 Gemini Chat
// =======================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// Chat route
app.post("/api/chat", async (req, res) => {
  const { message, role } = req.body;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    const rolePrompts = {
      buyer: `You are a PharmaConnect assistant for buyers. Help find medicines, compare suppliers, check prices/MOQ. Be brief and direct.`,
      seller: `You are a PharmaConnect assistant for sellers. Help optimize listings, pricing strategy, inventory, and sales. Be brief and direct.`,
      admin: `You are a PharmaConnect assistant for admins. Help with analytics, user issues, verifications, and platform insights. Be brief and direct.`
    };

    const systemPrompt = rolePrompts[role] || rolePrompts.buyer;
    const prompt = `${systemPrompt}\n\nQuery: ${message}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error("CHAT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// =======================
// 🔹 Start Server
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
