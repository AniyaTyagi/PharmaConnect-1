const express = require("express");
const router = express.Router();
const Invoice = require("../models/invoice");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Get buyer's invoices
router.get("/my", protect, authorizeRoles("buyer", "wholesaler"), async (req, res) => {
  try {
    const invoices = await Invoice.find({ buyer: req.user.id })
      .populate("seller", "name email")
      .populate("order")
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get seller's invoices
router.get("/seller", protect, authorizeRoles("seller", "manufacturer"), async (req, res) => {
  try {
    console.log("Fetching invoices for seller:", req.user.id);
    const invoices = await Invoice.find({ seller: req.user.id })
      .populate("buyer", "name email")
      .populate("order")
      .sort({ createdAt: -1 });
    console.log("Found invoices:", invoices.length);
    res.json(invoices);
  } catch (err) {
    console.error("Invoice fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all invoices (admin only)
router.get("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("order")
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single invoice
router.get("/:id", protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("order")
      .populate("items.product", "name category");

    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    // Check authorization
    const isAuthorized = 
      req.user.role === "admin" ||
      invoice.buyer.toString() === req.user.id.toString() ||
      invoice.seller.toString() === req.user.id.toString();

    if (!isAuthorized) return res.status(403).json({ error: "Not authorized" });

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update invoice status (seller/admin only)
router.patch("/:id/status", protect, authorizeRoles("seller", "manufacturer", "admin"), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    // Sellers can only update their own invoices
    if (
      (req.user.role === "seller" || req.user.role === "manufacturer") &&
      invoice.seller.toString() !== req.user.id.toString()
    ) return res.status(403).json({ error: "Not authorized" });

    invoice.status = req.body.status;
    if (req.body.status === "paid") invoice.paidDate = new Date();
    
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
