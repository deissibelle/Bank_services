const express = require("express");
const { body, param, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth, authorize, asyncHandler } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body("firstName").optional().trim().isLength({ min: 2, max: 50 }),
  body("lastName").optional().trim().isLength({ min: 2, max: 50 }),
  body("phone")
    .optional()
    .matches(/^\+?[\d\s-()]{10,}$/),
  body("address").optional().isObject(),
  body("preferences").optional().isObject(),
];

// Get all users (admin only)
router.get(
  "/",
  auth,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, role, search } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      select:
        "-refreshTokens -emailVerificationToken -passwordResetToken -twoFactorSecret",
    };

    const users = await User.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort)
      .select(options.select);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          pages: Math.ceil(total / options.limit),
        },
      },
    });
  })
);

// Get user by ID (admin or own user)
router.get(
  "/:id",
  auth,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Check if user is admin or requesting own profile
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    const user = await User.findById(userId).select(
      "-refreshTokens -emailVerificationToken -passwordResetToken -twoFactorSecret"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  })
);

// Update user (own profile)
router.patch(
  "/profile",
  auth,
  updateUserValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, phone, address, preferences } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (preferences)
      updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select(
      "-refreshTokens -emailVerificationToken -passwordResetToken -twoFactorSecret"
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  })
);

// Update user status (admin only)
router.patch(
  "/:id/status",
  auth,
  authorize("admin"),
  [
    param("id").isMongoId(),
    body("status").isIn(["active", "inactive", "suspended", "pending"]),
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

    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).select(
      "-refreshTokens -emailVerificationToken -passwordResetToken -twoFactorSecret"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: { user },
    });
  })
);

// Update user role (admin only)
router.patch(
  "/:id/role",
  auth,
  authorize("admin"),
  [
    param("id").isMongoId(),
    body("role").isIn(["customer", "admin", "support"]),
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

    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select(
      "-refreshTokens -emailVerificationToken -passwordResetToken -twoFactorSecret"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: { user },
    });
  })
);

module.exports = router;
