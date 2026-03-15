const router = require("express").Router()
const {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
} = require("../controllers/authController");
const { verifyEmail } = require("../controllers/verifyEmail");
const { registerLimiter, loginLimiter, refreshLimiter } = require("../middlewares/rateLimiter");
const validate = require("../middlewares/validate");
const { registrationSchema, loginSchema, vendorValidationSchema } = require("../validation/auth.validation");

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
router.post("/register", registerLimiter, validate(registrationSchema), register);

router.get("/verify-email", validate(loginSchema), verifyEmail);
router.post("/login", loginLimiter, login);

router.post("/refresh-token", refreshLimiter, refreshToken);

router.post("/logout", logout);
router.post("/logout-all", logoutAll);

router.post("/refresh-token", refreshLimiter, refreshToken);

router.post("/register-vendor", registerLimiter, validate(vendorValidationSchema), registerVendor);
module.exports = router;
