const Verification = require("../models/verifications");
const Approval = require("../models/approvals");
const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const sendApprovalEmail = require("../utils/SendEmail");

// 🔥 1. SUBMIT VERIFICATION (USER SIDE)
exports.submitVerification = async (req, res) => {
  try {
    const data = req.body;

    if (!data.password) return res.status(400).json({ error: "Password is required" });

    // Check if email already exists in Users collection
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered. Please login or use a different email." });
    }

    // Check if email already exists in Approvals collection
    const existingApproval = await Approval.findOne({ email: data.email });
    if (existingApproval) {
      return res.status(400).json({ message: "Email already approved. Please login or contact admin." });
    }

    // Check if email already exists in pending Verifications
    const existing = await Verification.findOne({ email: data.email });
    if (existing) {
      // Update existing verification instead of creating duplicate
      const passwordHash = await bcrypt.hash(data.password, 10);
      const updated = await Verification.findByIdAndUpdate(
        existing._id,
        { ...data, passwordHash, password: undefined },
        { new: true }
      );
      return res.status(200).json({ 
        message: "Verification updated successfully. Your previous request has been updated.", 
        verification: updated 
      });
    }

    // Hash password before storing — plain text never hits MongoDB
    const passwordHash = await bcrypt.hash(data.password, 10);
    const verification = new Verification({ ...data, passwordHash, password: undefined });

    await verification.save();

    res.status(201).json({ message: "Verification submitted successfully", verification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// 🔥 2. GET ALL VERIFICATIONS (ADMIN)
exports.getAllVerifications = async (req, res) => {
  try {
    const verifications = await Verification.find().sort({ createdAt: -1 });

    res.json(verifications);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// 🔥 3. GET BY ROLE (FILTER)
exports.getByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const data = await Verification.find({ role });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// 🔥 4. APPROVE
exports.approveVerification = async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id);
    if (!verification) return res.status(404).json({ message: "Not found" });

    await Approval.create({
      name: verification.name,
      email: verification.email,
      role: verification.role,
      businessName: verification.businessName,
      contactPerson: verification.contactPerson,
      licenseNumber: verification.licenseNumber,
      gstNumber: verification.gstNumber,
      address: verification.address,
      city: verification.city,
      state: verification.state,
      pincode: verification.pincode,
      drugLicense: verification.drugLicense,
      manufacturingLicense: verification.manufacturingLicense,
      // password intentionally excluded
    });

    await Verification.findByIdAndDelete(req.params.id);

    // passwordHash already bcrypt-hashed from submission
    const loginRole = verification.role === 'wholesaler' ? 'buyer' : verification.role;
    await User.findOneAndUpdate(
      { email: verification.email },
      { name: verification.name, password: verification.passwordHash, role: loginRole },
      { upsert: true }
    );

    await sendApprovalEmail(verification.email, verification.role, "your registered password");

    res.json({ message: "User approved and email sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// 🔥 5. REJECT
exports.rejectVerification = async (req, res) => {
  try {
    const verification = await Verification.findByIdAndDelete(req.params.id);
    if (!verification) return res.status(404).json({ message: "Not found" });
    res.json({ message: "User rejected", verification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};