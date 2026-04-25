const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const Approval = require("../models/approvals");
const Product = require("../models/products");
const Order = require("../models/orders");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const adminOnly = [protect, authorizeRoles("admin")];
// GET ALL LOGIN USERS
router.get("/users", ...adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL APPROVED REGISTRATIONS (with business details)
router.get("/approved", ...adminOnly, async (req, res) => {
  try {
    const approved = await Approval.find().sort({ createdAt: -1 });
    res.json(approved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE USER
router.delete("/users/:id", ...adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ADMIN REPORTS/STATS
router.get("/reports", ...adminOnly, async (req, res) => {
  try {
    // Fetch all data
    const [users, products, orders] = await Promise.all([
      User.find({}, "-password"),
      Product.find().populate("seller", "name"),
      Order.find().populate("buyer", "name").populate("seller", "name")
    ]);

    // User breakdown
    const usersByRole = {
      buyer: users.filter(u => u.role === "buyer").length,
      seller: users.filter(u => u.role === "seller").length,
      manufacturer: users.filter(u => u.role === "manufacturer").length,
      admin: users.filter(u => u.role === "admin").length
    };

    // Transaction status breakdown
    const transactionsByStatus = {
      pending: orders.filter(o => o.status === "pending").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      cancelled: orders.filter(o => o.status === "cancelled").length
    };

    // Calculate platform revenue (exclude cancelled orders)
    const platformRevenue = orders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    // Top sellers by revenue
    const sellerRevenue = {};
    orders.forEach(order => {
      if (order.status !== "cancelled" && order.seller) {
        const sellerName = order.seller.name || "Unknown";
        if (!sellerRevenue[sellerName]) {
          sellerRevenue[sellerName] = { name: sellerName, revenue: 0, orders: 0 };
        }
        sellerRevenue[sellerName].revenue += order.total;
        sellerRevenue[sellerName].orders += 1;
      }
    });

    const topSellers = Object.values(sellerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Product categories breakdown
    const productsByCategory = {};
    products.forEach(p => {
      productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
    });

    res.json({
      stats: {
        totalUsers: users.length,
        totalProducts: products.length,
        totalTransactions: orders.length,
        platformRevenue
      },
      usersByRole,
      transactionsByStatus,
      topSellers,
      productsByCategory,
      recentOrders: orders.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
