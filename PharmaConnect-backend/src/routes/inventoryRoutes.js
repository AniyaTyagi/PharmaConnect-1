const express = require("express");
const router = express.Router();
const Inventory = require("../models/inventory");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const sellerOnly = [protect, authorizeRoles("seller", "manufacturer", "admin")];

// Get seller's inventory
router.get("/", ...sellerOnly, async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { seller: req.user.id };
    const inventory = await Inventory.find(query)
      .populate("product", "name category price expiryDate images")
      .populate("seller", "name email")
      .sort({ updatedAt: -1 });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get low stock items
router.get("/alerts", ...sellerOnly, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 50;
    const query = { stock: { $lte: threshold } };
    if (req.user.role !== "admin") query.seller = req.user.id;
    
    const alerts = await Inventory.find(query)
      .populate("product", "name category")
      .sort({ stock: 1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
