const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");
const Product = require("../models/products");

const sellerOnly = [protect, authorizeRoles("seller", "manufacturer", "admin")];

// Public — anyone can browse products (no auth required)
router.get("/public", productController.getProducts);

// Protected — buyers and sellers can browse
router.get("/", protect, productController.getProducts);

// Stock alerts — seller's own products below threshold
router.get("/stock-alerts", ...sellerOnly, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 50;
    const query = { stock: { $lte: threshold } };
    if (req.user.role === "seller" || req.user.role === "manufacturer")
      query.seller = req.user.id;
    const products = await Product.find(query).select("name stock category seller");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", ...sellerOnly, upload.array("images", 5), productController.addProduct);

// upload.any() handles both multipart (with images) and falls through for JSON
router.put("/:id", ...sellerOnly, upload.any(), productController.updateProduct);

router.delete("/:id", ...sellerOnly, productController.deleteProduct);

module.exports = router;
