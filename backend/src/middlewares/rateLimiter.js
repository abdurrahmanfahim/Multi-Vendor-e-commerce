const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: {
    success: false,
    message: "Too many registration attempts, please try again after 15 minutes!"
  },
  standardHeaders: true, // return rate limit information in headers
  legacyHeaders: false
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes!"
  },
  standardHeaders: true, // return rate limit information in headers
  legacyHeaders: false
})

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: {
    success: false,
    message: "Too many refresh token attempts, please try again after 15 minutes!"
  },
  standardHeaders: true, // return rate limit information in headers
  legacyHeaders: false
})

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: {
    success: false,
    message: "Too many API requests, please try again after 15 minutes!"
  },
  standardHeaders: true, // return rate limit information in headers
  legacyHeaders: false
})

module.exports = {
  registerLimiter,
  loginLimiter,
  refreshLimiter,
  apiLimiter
}