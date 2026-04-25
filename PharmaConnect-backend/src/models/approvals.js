const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ["wholesaler", "manufacturer"], required: true },
  businessName: String,
  contactPerson: String,
  licenseNumber: String,
  gstNumber: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  drugLicense: String,
  manufacturingLicense: String,
  approvedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Approval", approvalSchema, "approved");
