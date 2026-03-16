const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/auth");
const {
  approveVendor,
  rejectVendor,
  getApprovedVendors,
  getAllVendors,
  getPendingVendors,
  getRejectedVendors,
  getAllUsers,
  deleteUser,
  getAdminStats,
} = require("../controllers/adminController");

// All admin routes are protected and restricted to admin role only
router.use(protect, restrictTo("admin"));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints for vendor management, user management and dashboard stats. Requires Bearer token with `admin` role.
 */

/**
 * @swagger
 * /api/v1/admin/vendors/pending:
 *   get:
 *     summary: List pending vendor applications
 *     description: Returns all vendor accounts with `status = pending` awaiting admin review.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending vendors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       name: { type: string }
 *                       email: { type: string, format: email }
 *                       shopName: { type: string }
 *                       shopAddress: { type: string }
 *                       nidNumber: { type: string }
 *                       createdAt: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized — missing or invalid Bearer token
 *       403:
 *         description: Forbidden — caller is not an admin
 *       500:
 *         description: Internal server error
 */
router.get("/vendors/pending", getPendingVendors);

/**
 * @swagger
 * /api/v1/admin/vendors/all:
 *   get:
 *     summary: List all vendors
 *     description: Returns every vendor regardless of status, including approval/rejection metadata.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All vendors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VendorListItem'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/vendors/all", getAllVendors);

/**
 * @swagger
 * /api/v1/admin/vendors/approved:
 *   get:
 *     summary: List approved vendors
 *     description: Returns all vendor accounts with `status = approved`.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approved vendors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       name: { type: string }
 *                       email: { type: string, format: email }
 *                       shopName: { type: string }
 *                       shopAddress: { type: string }
 *                       nidNumber: { type: string }
 *                       approvedAt: { type: string, format: date-time }
 *                       createdAt: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/vendors/approved", getApprovedVendors);

/**
 * @swagger
 * /api/v1/admin/vendors/rejected:
 *   get:
 *     summary: List rejected vendors
 *     description: Returns all vendor accounts with `status = rejected`, including the rejection reason.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rejected vendors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       name: { type: string }
 *                       email: { type: string, format: email }
 *                       shopName: { type: string }
 *                       shopAddress: { type: string }
 *                       nidNumber: { type: string }
 *                       rejectReason: { type: string }
 *                       rejectedAt: { type: string, format: date-time }
 *                       createdAt: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/vendors/rejected", getRejectedVendors);

/**
 * @swagger
 * /api/v1/admin/vendors/{id}/approve:
 *   put:
 *     summary: Approve a vendor application
 *     description: |
 *       Sets the vendor's `status` to `approved` and records the `approvedAt` timestamp.
 *       The vendor can then log in and start selling.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the vendor user
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Vendor approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *             example:
 *               success: true
 *               message: "Vendor approved successfully!"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Vendor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Vendor not found!"
 *       500:
 *         description: Internal server error
 */
router.put("/vendors/:id/approve", approveVendor);

/**
 * @swagger
 * /api/v1/admin/vendors/{id}/reject:
 *   put:
 *     summary: Reject a vendor application
 *     description: |
 *       Sets the vendor's `status` to `rejected`, records the `rejectReason` and `rejectedAt` timestamp.
 *       Only vendors with `status = pending` can be rejected.
 *       A rejection **reason is required**.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the vendor user
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectVendorRequest'
 *     responses:
 *       200:
 *         description: Vendor rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *             example:
 *               success: true
 *               message: "Vendor rejected successfully!"
 *       400:
 *         description: Rejection reason is missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Rejection reason is required!"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Vendor not found or already processed (not in pending state)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Vendor not found or already processed!"
 *       500:
 *         description: Internal server error
 */
router.put("/vendors/:id/reject", rejectVendor);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     description: |
 *       Returns an aggregated overview of platform stats including total users, customers,
 *       vendors broken down by status, and new registrations in the last 24 hours.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AdminStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/stats", getAdminStats);

/**
 * @swagger
 * /api/v1/admin/users/all:
 *   get:
 *     summary: List all customers
 *     description: Returns all users with `role = customer`, sorted by newest first.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 42
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserListItem'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get("/users/all", getAllUsers);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Permanently deletes a user document from the database. This action is irreversible.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user to delete
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *             example:
 *               success: true
 *               message: "User deleted successfully!"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "User not found!"
 *       500:
 *         description: Internal server error
 */
router.delete("/users/:id", deleteUser);

module.exports = router;
