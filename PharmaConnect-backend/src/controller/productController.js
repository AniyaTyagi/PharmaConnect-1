const Product = require("../models/products");

exports.addProduct = async (req, res) => {
  try {
    const productData = { ...req.body, seller: req.user.id };
    if (req.files?.length > 0)
      productData.images = req.files.map((f) => f.path);
    const saved = await new Product(productData).save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name email role");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (
      (req.user.role === "seller" || req.user.role === "manufacturer") &&
      product.seller?.toString() !== req.user.id.toString()
    ) return res.status(403).json({ error: "Not authorized to update this product" });

    // Whitelist updatable fields — block seller, status, _id overwrite
    const { name, description, category, price, stock, brand, batchNumber, manufacturer, expiryDate } = req.body;
    const updateData = { name, description, category, price, stock, brand, batchNumber, manufacturer, expiryDate };
    // Remove undefined keys so partial updates work
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    if (req.files?.length > 0)
      updateData.images = req.files.map((f) => f.path);

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (
      (req.user.role === "seller" || req.user.role === "manufacturer") &&
      product.seller?.toString() !== req.user.id.toString()
    ) return res.status(403).json({ error: "Not authorized to delete this product" });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
