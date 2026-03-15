const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/auth");
const { approveVendor, rejectVendor, getApprovedVendors, getAllVendors, getPendingVendors, getRejectedVendors, getAllUsers, deleteUser, getAdminStats } = require("../controllers/adminController");



// All admin routes are protected and restricted to admin role only
router.use(protect, restrictTo("admin"));

// Vendor management routes
router.get("/vendors/pending", getPendingVendors);
router.get("/vendors/all", getAllVendors);
router.get("/vendors/approved", getApprovedVendors);
router.put("/vendors/:id/approve", approveVendor);
router.put("/vendors/:id/reject", rejectVendor);
router.get("/vendors/rejected", getRejectedVendors);

router.get("/stats", getAdminStats)

// Basic user management routes
router.get("/users/all", getAllUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;