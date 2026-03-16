const router = require("express").Router();
const {
  register,
  registerVendor,
  login,
  refreshToken,
  logout,
  logoutAll,
} = require("../controllers/authController");
const { verifyEmail } = require("../controllers/verifyEmail");
const { protect } = require("../middlewares/auth");
const { registerLimiter, loginLimiter, refreshLimiter } = require("../middlewares/rateLimiter");
const validate = require("../middlewares/validate");
const { registrationSchema, loginSchema, vendorValidationSchema } = require("../validation/auth.validation");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication — registration, email verification, login, token refresh and logout
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new customer account
 *     description: |
 *       Creates a new customer account and sends a verification email.
 *       The user must verify their email before they can log in.
 *       Rate-limited to prevent abuse.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful — verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Missing required fields or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Name, Email and Password are required!"
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Email already registered!"
 *       429:
 *         description: Too many requests — rate limit exceeded
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", registerLimiter, validate(registrationSchema), register);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   get:
 *     summary: Verify a user's email address
 *     description: |
 *       Validates the one-time token sent to the user's email.
 *       On success, marks the account as verified and redirects to the frontend success page.
 *       The token expires after 24 hours.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID verification token from the email link
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: The email address being verified
 *         example: "john@example.com"
 *     responses:
 *       302:
 *         description: Email verified — redirects to frontend /verify-success page
 *       400:
 *         description: Invalid or expired token, or email mismatch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidToken:
 *                 summary: Token not found or expired
 *                 value:
 *                   message: "Invalid or expired token!"
 *               invalidRequest:
 *                 summary: Email does not match token
 *                 value:
 *                   message: "Invalid request!"
 *       500:
 *         description: Internal server error
 */
router.get("/verify-email", verifyEmail);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and receive tokens
 *     description: |
 *       Authenticates the user with email and password.
 *       Returns a short-lived JWT **access token** in the response body and sets a
 *       long-lived **refresh token** as an HTTP-only cookie (`refreshToken`, 7 days).
 *       Rate-limited to prevent brute-force attacks.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie (refreshToken)
 *             schema:
 *               type: string
 *               example: "refreshToken=eyJ...; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid credentials!"
 *       429:
 *         description: Too many login attempts — rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post("/login", loginLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh the access token
 *     description: |
 *       Issues a new JWT access token using the `refreshToken` HTTP-only cookie.
 *       No request body is needed — the cookie is sent automatically by the browser.
 *       Rate-limited to prevent token-refresh abuse.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       400:
 *         description: No refresh token cookie found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "No refresh token found!"
 *       403:
 *         description: Refresh token is invalid, expired, or not associated with any user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid or expire refresh token"
 *       429:
 *         description: Too many requests — rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post("/refresh-token", refreshLimiter, refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout from the current session
 *     description: |
 *       Removes the current refresh token from the user's token list and clears the
 *       `refreshToken` cookie. If no cookie is present, returns 204 silently.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *             example:
 *               success: true
 *               message: "Logged out successfully!"
 *       204:
 *         description: No active session found (no cookie present) — no action taken
 *       500:
 *         description: Internal server error
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: |
 *       Clears **all** stored refresh tokens for the user, effectively invalidating every
 *       active session across all devices. Identifies the user via the Bearer access token
 *       (if present) or falls back to the `refreshToken` cookie.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *             example:
 *               success: true
 *               message: "Logged out from all devices successfully!"
 *       401:
 *         description: Not authorized — no valid token or cookie provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post("/logout-all", logoutAll);

/**
 * @swagger
 * /api/v1/auth/register-vendor:
 *   post:
 *     summary: Register a new vendor account
 *     description: |
 *       Creates a vendor account with shop and banking details.
 *       The account is set to **pending** status and must be approved by an admin
 *       before the vendor can operate. Rate-limited to prevent abuse.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorRegistrationRequest'
 *     responses:
 *       201:
 *         description: Vendor registration submitted — pending admin approval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VendorRegistrationResponse'
 *       400:
 *         description: Missing required fields or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "All fields are required!"
 *       409:
 *         description: Email or NID number already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               emailConflict:
 *                 summary: Email already in use
 *                 value:
 *                   success: false
 *                   message: "Email already registered! You are already a vendor or customer."
 *               nidConflict:
 *                 summary: NID already registered
 *                 value:
 *                   success: false
 *                   message: "NID number already registered! You are already a vendor."
 *       429:
 *         description: Too many requests — rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.post("/register-vendor", registerLimiter, validate(vendorValidationSchema), registerVendor);

module.exports = router;
