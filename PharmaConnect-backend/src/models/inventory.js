const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true
  },
  name: String,
  batchNumber: String,
  stock: { type: Number, default: 0 },
  lastRestocked: Date,
  lowStockAlert: { type: Boolean, default: false },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Inventory", inventorySchema);
