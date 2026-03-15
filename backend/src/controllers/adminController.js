const { success } = require("zod");
const User = require("../models/User");

exports.approveVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await User.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found!" });
    }

    vendor.status = "approved";
    vendor.approvedAt = new Date();
    await vendor.save();

    // TODO: Send approval email to the vendor

    res
      .status(200)
      .json({ success: true, message: "Vendor approved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve vendor!" });
  }
};

exports.getPendingVendors = async (req, res) => {
  try {
    const pendingVendors = await User.find({
      role: "vendor",
      status: "pending",
    }).select("name email shopName shopAddress nidNumber createdAt ");

    res.status(200).json({ success: true, data: pendingVendors });
  } catch (error) {
    console.error("Failed to fetch pending vendors!", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch pending vendors!" });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select(
      "name email shopName shopAddress approvedAt rejectReason rejectedAt nidNumber status createdAt",
    );
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    console.error("Failed to fetch vendors!", error);
    res.status(500).json({ success: false, error: "Failed to fetch vendors!" });
  }
};

exports.getApprovedVendors = async (req, res) => {
  try {
    const approvedVendors = await User.find({
      role: "vendor",
      status: "approved",
    }).select("name email shopName shopAddress nidNumber approvedAt createdAt");
    res.status(200).json({ success: true, data: approvedVendors });
  } catch (error) {
    console.error("Failed to fetch approved vendors!", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch approved vendors!" });
  }
};

exports.rejectVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required!" });
    }

    const vendor = await User.findOneAndUpdate(
      { _id: vendorId, role: "vendor", status: "pending" },
      { status: "rejected", rejectReason: reason, rejectedAt: new Date() },
      { new: true },
    ).select(
      "name email shopName shopAddress nidNumber rejectReason createdAt",
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: "Vendor not found or already processed!",
      });
    }

    // TODO: Send rejection email to the vendor

    res
      .status(200)
      .json({ success: true, message: "Vendor rejected successfully!" });
  } catch (error) {
    console.error("Failed to reject vendor!", error);
    res.status(500).json({ success: false, error: "Failed to reject vendor!" });
  }
};

exports.getRejectedVendors = async (req, res) => {
  try {
    const rejectedVendors = await User.find({
      role: "vendor",
      status: "rejected",
    }).select(
      "name email shopName shopAddress nidNumber rejectReason rejectedAt createdAt",
    );
    res.status(200).json({ success: true, data: rejectedVendors });
  } catch (error) {
    console.error("Failed to fetch rejected vendors!", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch rejected vendors!" });
  }
};

// User management

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "customer" })
      .select("name email phone role status createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("Failed to fetch users!", error);
    res.status(500).json({ success: false, error: "Failed to fetch users!" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found!" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully!" });
  } catch (error) {
    console.error("Failed to delete user!", error);
    res.status(500).json({ success: false, error: "Failed to delete user!" });
  }
};

// Admin dashboard stats

exports.getAdminStats = async (req, res) => {
  try {
    // const totalVendors = await User.countDocuments({ role: "vendor" });
    // const totalCustomers = await User.countDocuments({ role: "customer" });
    // const totalAdmins = await User.countDocuments({ role: "admin" });

    const [
      totalUsers,
      totalCustomers,
      totalVendors,
      vendorStats,
      pendingVendors,
      approvedVendors,
      rejectedVendors,
      suspendedVendors,
    ] = await Promise.all([
      // Total Users
      User.countDocuments({ role: "vendor" }),
      // Total Customers
      User.countDocuments({ role: "customer" }),
      // Vendor breakdown using aggregation pipeline
      User.aggregate([
        { $match: { role: "vendor" } },
        {
          $group: {
            _id: null,
            totalVendors: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
            suspended: {
              $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] },
            },
          },
        },
      ]),

      // Pending Vendors
      User.countDocuments({ role: "vendor", status: "pending" }),
      // Approved Vendors
      User.countDocuments({ role: "vendor", status: "approved" }),
      // Rejected Vendors
      User.countDocuments({ role: "vendor", status: "rejected" }),
      // Suspended Vendors
      User.countDocuments({ role: "vendor", status: "suspended" }),
    ]);

    const vendorBreakdown = vendorStats[0] || {
      totalVendors: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      suspended: 0,
    };

    const stats = {
      overview: {
        totalUsers,
        totalCustomers,
        totalVendors: vendorBreakdown.totalVendors || totalVendors,
      },
      vendorStats: {
        approved: vendorBreakdown.approved || approvedVendors,
        pending: vendorBreakdown.pending || pendingVendors,
        rejected: vendorBreakdown.rejected || rejectedVendors,
        suspended: vendorBreakdown.suspended || suspendedVendors,
      },
      newRegistrationsToday: await User.countDocuments({
        role: "vendor",
        createdAt: {
          $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hours
        },
      }),
      timeStamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Failed to fetch admin stats!", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch admin stats!" });
  }
};
