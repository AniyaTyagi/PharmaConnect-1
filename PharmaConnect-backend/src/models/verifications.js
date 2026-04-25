const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
  // 🔹 Common fields (sab me same)
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["buyer", "wholesaler", "manufacturer"],
    required: true
  },

  joined: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  // 🔹 Common business fields (wholesale + manufacturer)
  businessName: String,
  contactPerson: String,
  licenseNumber: String,
  gstNumber: String,
  address: String,
  city: String,
  state: String,
  pincode: String,

  // 🔹 Manufacturer / Seller extra fields
  drugLicense: String,
  manufacturingLicense: String,

  // 🔹 Password stored as bcrypt hash only
  passwordHash: String

}, { timestamps: true });

verificationSchema.pre("save", async function () {
  if (this.role === "wholesaler") {
    if (!this.businessName || !this.gstNumber) {
      throw new Error("Missing wholesaler details");
    }
  }

  if (this.role === "manufacturer") {
    if (!this.drugLicense || !this.manufacturingLicense) {
      throw new Error("Missing manufacturer licenses");
    }
  }
});

module.exports = mongoose.model("Verifications", verificationSchema);