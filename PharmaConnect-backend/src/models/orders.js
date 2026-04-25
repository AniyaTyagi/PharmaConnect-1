const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyer:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items:  [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, name: String, quantity: Number, price: Number }],
  total:  { type: Number, required: true },
  status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending" },
}, { timestamps: true });

// Auto-create invoice when order is created
orderSchema.post("save", async function(doc) {
  try {
    const Invoice = mongoose.model("Invoice");
    
    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ order: doc._id });
    if (existingInvoice) {
      console.log("Invoice already exists for order:", doc._id);
      return;
    }

    // Calculate invoice details
    const items = doc.items.map(item => ({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
    }));

    const subtotal = doc.total;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    // Generate invoice number
    const count = await Invoice.countDocuments();
    const date = new Date();
    const invoiceNumber = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`;

    console.log("Creating invoice for order:", doc._id);
    console.log("Generated invoice number:", invoiceNumber);

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      order: doc._id,
      buyer: doc.buyer,
      seller: doc.seller,
      items,
      subtotal,
      tax,
      total,
      status: "sent",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    
    console.log("Invoice created successfully:", invoice.invoiceNumber);
  } catch (err) {
    console.error("Invoice creation error:", err);
  }
});

// Update invoice when order status changes
orderSchema.post("findOneAndUpdate", async function(doc) {
  if (!doc) return;
  
  try {
    const Invoice = mongoose.model("Invoice");
    
    const invoice = await Invoice.findOne({ order: doc._id });
    if (!invoice) {
      console.log("No invoice found for order:", doc._id);
      return;
    }

    console.log("Updating invoice:", invoice.invoiceNumber, "for order status:", doc.status);

    // Update invoice status based on order status
    if (doc.status === "delivered") {
      invoice.status = "paid";
      invoice.paidDate = new Date();
    } else if (doc.status === "cancelled") {
      invoice.status = "cancelled";
    }
    
    await invoice.save();
    console.log("Invoice updated successfully");
  } catch (err) {
    console.error("Invoice update error:", err);
  }
});

module.exports = mongoose.model("Order", orderSchema);
