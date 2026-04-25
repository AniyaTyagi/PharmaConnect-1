const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  submitVerification,
  getAllVerifications,
  getByRole,
  approveVerification,
  rejectVerification
} = require("../controller/verificationController");

const adminOnly = [protect, authorizeRoles("admin")];

const validate = require("../middleware/validate");

// Public — anyone can submit a registration
router.post("/submit",
  validate({
    name:         { required: true, minLength: 2 },
    email:        { required: true, email: true },
    password:     { required: true, minLength: 6 },
    role:         { required: true },
    businessName: { required: true },
    gstNumber:    { required: true },
  }),
  submitVerification
);

// Admin only
router.get("/", ...adminOnly, getAllVerifications);
router.get("/role/:role", ...adminOnly, getByRole);
router.put("/approve/:id", ...adminOnly, approveVerification);
router.put("/reject/:id", ...adminOnly, rejectVerification);
router.delete("/:id", ...adminOnly, async (req, res) => {
  try {
    await require("../models/verifications").findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;