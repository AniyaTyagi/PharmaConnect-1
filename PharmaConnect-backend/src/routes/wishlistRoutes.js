const express = require("express");
const router = express.Router();
const Wishlist = require("../models/wishlist");
const Product = require("../models/products");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Get user's wishlist
router.get("/", protect, authorizeRoles("buyer", "wholesaler"), async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: "products",
      populate: { path: "seller", select: "name email" }
    });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }
    
    res.json(wishlist.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product to wishlist
router.post("/add/:productId", protect, authorizeRoles("buyer", "wholesaler"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [req.params.productId] });
    } else {
      if (wishlist.products.includes(req.params.productId)) {
        return res.status(400).json({ error: "Product already in wishlist" });
      }
      wishlist.products.push(req.params.productId);
      await wishlist.save();
    }
    
    await wishlist.populate({
      path: "products",
      populate: { path: "seller", select: "name email" }
    });
    
    res.json(wishlist.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove product from wishlist
router.delete("/remove/:productId", protect, authorizeRoles("buyer", "wholesaler"), async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }
    
    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== req.params.productId
    );
    await wishlist.save();
    
    await wishlist.populate({
      path: "products",
      populate: { path: "seller", select: "name email" }
    });
    
    res.json(wishlist.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear entire wishlist
router.delete("/clear", protect, authorizeRoles("buyer", "wholesaler"), async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (wishlist) {
      wishlist.products = [];
      await wishlist.save();
    }
    
    res.json({ message: "Wishlist cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
