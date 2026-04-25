const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const Product = require("../models/products");
const Inventory = require("../models/inventory");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Place order — buyers only
router.post("/", protect, authorizeRoles("buyer", "wholesaler"), async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ error: "Cart is empty" });

    let sellerId = null;
    let total = 0;
    const deductions = []; // track what to deduct after all checks pass

    for (const item of items) {
      // Atomic check-and-deduct: only succeeds if stock >= quantity
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: false } // return doc before update to read price/seller
      ).populate("seller");

      if (!product) {
        // Either product not found or insufficient stock — roll back previous deductions
        for (const d of deductions) {
          await Product.findByIdAndUpdate(d.id, { $inc: { stock: d.qty } });
          // Rollback inventory too
          await Inventory.findOneAndUpdate(
            { product: d.id },
            { $inc: { stock: d.qty } }
          );
        }
        const exists = await Product.findById(item.product);
        if (!exists) return res.status(400).json({ error: `Product "${item.name}" no longer exists` });
        return res.status(400).json({ error: `Insufficient stock for "${exists.name}". Available: ${exists.stock}` });
      }

      // Update inventory collection
      await Inventory.findOneAndUpdate(
        { product: product._id },
        { 
          $inc: { stock: -item.quantity },
          lowStockAlert: (product.stock - item.quantity) < 50
        },
        { upsert: true }
      );

      deductions.push({ id: product._id, qty: item.quantity });
      item.price = product.price;
      total += product.price * item.quantity;
      if (!sellerId) sellerId = product.seller?._id;
    }

    const order = await Order.create({ buyer: req.user.id, seller: sellerId, items, total });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get buyer's own orders — buyers only
router.get("/my", protect, authorizeRoles("buyer", "wholesaler"), async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders — seller and admin only
router.get("/", protect, authorizeRoles("seller", "manufacturer", "admin"), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "seller" || req.user.role === "manufacturer") {
      const sellerProducts = await Product.find({ seller: req.user.id }).select("_id");
      const productIds = sellerProducts.map((p) => p._id);
      // Match orders where seller field matches OR any item belongs to this seller's products
      const conditions = [{ seller: req.user.id }];
      if (productIds.length > 0) conditions.push({ "items.product": { $in: productIds } });
      query = { $or: conditions };
    }
    const orders = await Order.find(query)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status — seller and admin only
router.patch("/:id/status", protect, authorizeRoles("seller", "manufacturer", "admin"), async (req, res) => {
  try {
    console.log("Status update attempt - Order ID:", req.params.id);
    console.log("Status update attempt - User ID:", req.user.id);
    console.log("Status update attempt - User Role:", req.user.role);
    console.log("Status update attempt - New Status:", req.body.status);

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    console.log("Order seller:", order.seller?.toString());
    console.log("Order items:", order.items.map(i => i.product?.toString()));

    // Sellers can only update orders that contain their products
    if (req.user.role === "seller" || req.user.role === "manufacturer") {
      const sellerProducts = await Product.find({ seller: req.user.id }).select("_id");
      const productIds = sellerProducts.map((p) => p._id.toString());
      console.log("Seller's product IDs:", productIds);
      
      const orderBelongsToSeller =
        order.seller?.toString() === req.user.id.toString() ||
        order.items.some((i) => productIds.includes(i.product?.toString()));
      
      console.log("Order belongs to seller:", orderBelongsToSeller);
      
      if (!orderBelongsToSeller)
        return res.status(403).json({ message: "Not authorized to update this order" });
    }

    const oldStatus = order.status;
    const newStatus = req.body.status;

    // If order is cancelled, restore stock
    if (newStatus === "cancelled" && oldStatus !== "cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        await Inventory.findOneAndUpdate({ product: item.product }, { $inc: { stock: item.quantity } });
      }
    }

    order.status = newStatus;
    await order.save();
    console.log("Order status updated successfully");
    res.json(order);
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
