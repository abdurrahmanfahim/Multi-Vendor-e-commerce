const router = require("express").Router()
const {
  register,
  login,
  refreshToken,
} = require("../controllers/authController");
const { verifyEmail } = require("../controllers/verifyEmail");

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user (customer or vendor)
 *     tags: [AUTH]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             required: [name, email, password]
 *             properties: 
 *               name: 
 *                 type: string
 *               email: 
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role: 
 *                 type: string
 *                 enum: [customer, vendor]
 *     responses: 
 *       201:
 *         description: User registration Successful
 *       400:
 *         description: Bad request          
 */
router.post("/register", register);

router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

module.exports = router;
