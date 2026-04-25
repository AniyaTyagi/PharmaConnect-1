const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["draft", "sent", "paid", "cancelled"],
    default: "sent"
  },
  dueDate: Date,
  paidDate: Date,
  notes: String
}, { timestamps: true });

// Generate invoice number automatically
invoiceSchema.pre("save", async function(next) {
  if (!this.invoiceNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const date = new Date();
      this.invoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;
      console.log("Generated invoice number:", this.invoiceNumber);
    } catch (err) {
      console.error("Invoice number generation error:", err);
    }
  }
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
