const axios = require('axios');

// Authentication middleware - verifies JWT with auth service
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token with auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const response = await axios.get(`${authServiceUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 5000
    });

    if (!response.data.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = response.data.data.user;
    next();
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Authentication failed'
      });
    }
    
    console.error('Auth service error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication service unavailable'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Account ownership middleware
const checkAccountOwnership = async (req, res, next) => {
  try {
    const { Account } = require('../models/Account');
    const accountId = req.params.id || req.params.accountId;
    
    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: 'Account ID is required'
      });
    }

    const account = await Account.findById(accountId);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Allow if user is account owner or admin/support
    if (account.userId !== req.user._id && !['admin', 'support'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this account'
      });
    }

    req.account = account;
    next();
  } catch (error) {
    next(error);
  }
};

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Custom application errors
  if (err.name === 'InsufficientFundsError') {
    return res.status(400).json({
      success: false,
      message: 'Insufficient funds for this transaction'
    });
  }

  if (err.name === 'AccountClosedError') {
    return res.status(400).json({
      success: false,
      message: 'Account is closed and cannot be used'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

// Request validation middleware
const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    next();
  };
};

// Account status check middleware
const checkAccountStatus = (req, res, next) => {
  if (!req.account) {
    return res.status(400).json({
      success: false,
      message: 'Account not found in request'
    });
  }

  if (req.account.status === 'closed') {
    return res.status(400).json({
      success: false,
      message: 'Account is closed'
    });
  }

  if (req.account.status === 'suspended') {
    return res.status(400).json({
      success: false,
      message: 'Account is suspended'
    });
  }

  if (req.account.status === 'inactive') {
    return res.status(400).json({
      success: false,
      message: 'Account is inactive'
    });
  }

  next();
};

// Transaction amount validation middleware
const validateTransactionAmount = (req, res, next) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than zero'
    });
  }

  if (amount > 100000) {
    return res.status(400).json({
      success: false,
      message: 'Amount exceeds maximum transaction limit'
    });
  }

  // Round to 2 decimal places
  req.body.amount = parseFloat(amount.toFixed(2));
  next();
};

module.exports = {
  auth,
  authorize,
  checkAccountOwnership,
  asyncHandler,
  errorHandler,
  validateRequest,
  checkAccountStatus,
  validateTransactionAmount
};