const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

const router = express.Router();

// Validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  body("firstName").trim().isLength({ min: 2, max: 50 }),
  body("lastName").trim().isLength({ min: 2, max: 50 }),
  body("phone").matches(/^\+?[\d\s-()]{10,}$/),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists(),
];

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Register new user
router.post(
  "/register",
  registerValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      phone,
      status: "pending",
      emailVerified: false,
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // In a real-world scenario, send verification email here
    // For now, we'll skip this step

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  })
);

// Login user
router.post(
  "/login",
  loginValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not active. Please verify your email or contact support.",
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    // Verify password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      user.lastFailedLogin = Date.now();

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Reset failed login attempts if successful
    user.failedLoginAttempts = 0;
    user.lastLogin = Date.now();
    user.lastLoginIP = req.ip;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token in database
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      isRevoked: false,
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  })
);

// Refresh token
router.post(
  "/refresh-token",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      if (decoded.type !== "refresh") {
        return res.status(401).json({
          success: false,
          message: "Invalid token type",
        });
      }

      // Find user and check if refresh token exists and is not revoked
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      const tokenExists = user.refreshTokens.find(
        (t) =>
          t.token === refreshToken && !t.isRevoked && t.expiresAt > Date.now()
      );

      if (!tokenExists) {
        return res.status(401).json({
          success: false,
          message: "Invalid or revoked refresh token",
        });
      }

      // Generate new tokens
      const newTokens = generateTokens(user._id);

      // Replace old refresh token with new one
      user.refreshTokens = user.refreshTokens.map((t) => {
        if (t.token === refreshToken) {
          return {
            token: newTokens.refreshToken,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            userAgent: req.headers["user-agent"],
            ipAddress: req.ip,
            isRevoked: false,
          };
        }
        return t;
      });

      await user.save();

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          tokens: newTokens,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
  })
);

// Logout user
router.post(
  "/logout",
  auth,
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Revoke refresh token
    req.user.refreshTokens = req.user.refreshTokens.map((t) => {
      if (t.token === refreshToken) {
        t.isRevoked = true;
      }
      return t;
    });

    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  })
);

// Get current user
router.get(
  "/me",
  auth,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      data: {
        user: {
          _id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          phone: req.user.phone,
          role: req.user.role,
          status: req.user.status,
          emailVerified: req.user.emailVerified,
          preferences: req.user.preferences,
        },
      },
    });
  })
);

// Change password
router.post(
  "/change-password",
  auth,
  [
    body("currentPassword").exists(),
    body("newPassword")
      .isLength({ min: 8 })
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      ),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;

    // Revoke all refresh tokens
    user.refreshTokens = user.refreshTokens.map((t) => {
      t.isRevoked = true;
      return t;
    });

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please login again with your new password.",
    });
  })
);

module.exports = router;
