const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  category: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  stock: {
    type: Number,
    required: true
  },

  brand: {
    type: String,
    default: ""
  },

  
  batchNumber: {
    type: String,
    default: ""
  },

  manufacturer: {
    type: String,
    default: ""
  },

  expiryDate: {
    type: Date,
    required: true
  },
  
  images: [String],

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved"
  }

}, {
  timestamps: true
});

// Middleware: Auto-sync with Inventory collection
productSchema.post("save", async function(doc) {
  const Inventory = mongoose.model("Inventory");
  await Inventory.findOneAndUpdate(
    { product: doc._id },
    {
      product: doc._id,
      name: doc.name,
      batchNumber: doc.batchNumber,
      stock: doc.stock,
      seller: doc.seller,
      lowStockAlert: doc.stock < 50,
      lastRestocked: doc.stock > 0 ? new Date() : undefined
    },
    { upsert: true, new: true }
  );
});

productSchema.post("findOneAndUpdate", async function(doc) {
  if (!doc) return;
  const Inventory = mongoose.model("Inventory");
  await Inventory.findOneAndUpdate(
    { product: doc._id },
    {
      name: doc.name,
      batchNumber: doc.batchNumber,
      stock: doc.stock,
      lowStockAlert: doc.stock < 50,
      lastRestocked: doc.stock > 0 ? new Date() : undefined
    },
    { upsert: true }
  );
});

productSchema.post("findOneAndDelete", async function(doc) {
  if (!doc) return;
  const Inventory = mongoose.model("Inventory");
  await Inventory.findOneAndDelete({ product: doc._id });
});

module.exports = mongoose.model("Product", productSchema);
