const express = require('express');
const { body, validationResult } = require('express-validator');
const { AccountType } = require('../models/Account');
const { auth, authorize, asyncHandler } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createAccountTypeValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('code').trim().isLength({ min: 2, max: 10 }).withMessage('Code must be 2-10 characters'),
  body('description').optional().trim().isLength({ max: 200 }),
  body('minimumBalance').optional().isFloat({ min: 0 }).withMessage('Minimum balance cannot be negative'),
  body('maximumBalance').optional().isFloat({ min: 0 }).withMessage('Maximum balance cannot be negative'),
  body('interestRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Interest rate must be 0-100%'),
  body('monthlyFee').optional().isFloat({ min: 0 }).withMessage('Monthly fee cannot be negative'),
  body('transactionLimit.daily').optional().isFloat({ min: 0 }),
  body('transactionLimit.monthly').optional().isFloat({ min: 0 }),
  body('features').optional().isArray(),
  body('features.*').optional().trim().isLength({ min: 1, max: 100 })
];

const updateAccountTypeValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('description').optional().trim().isLength({ max: 200 }),
  body('minimumBalance').optional().isFloat({ min: 0 }),
  body('maximumBalance').optional().isFloat({ min: 0 }),
  body('interestRate').optional().isFloat({ min: 0, max: 100 }),
  body('monthlyFee').optional().isFloat({ min: 0 }),
  body('transactionLimit.daily').optional().isFloat({ min: 0 }),
  body('transactionLimit.monthly').optional().isFloat({ min: 0 }),
  body('features').optional().isArray(),
  body('features.*').optional().trim().isLength({ min: 1, max: 100 }),
  body('isActive').optional().isBoolean()
];

// Get all account types (public for account creation)
router.get('/', asyncHandler(async (req, res) => {
  const { includeInactive = false } = req.query;
  
  const query = includeInactive === 'true' ? {} : { isActive: true };
  
  const accountTypes = await AccountType.find(query).sort({ name: 1 });

  res.json({
    success: true,
    data: { accountTypes }
  });
}));

// Get account type by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const accountType = await AccountType.findById(req.params.id);
  
  if (!accountType) {
    return res.status(404).json({
      success: false,
      message: 'Account type not found'
    });
  }

  res.json({
    success: true,
    data: { accountType }
  });
}));

// Create new account type (admin only)
router.post('/', auth, authorize('admin'), createAccountTypeValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    name,
    code,
    description,
    minimumBalance = 0,
    maximumBalance = 1000000,
    interestRate = 0,
    monthlyFee = 0,
    transactionLimit = { daily: 10000, monthly: 50000 },
    features = []
  } = req.body;

  // Validate that maximum balance is greater than minimum balance
  if (maximumBalance <= minimumBalance) {
    return res.status(400).json({
      success: false,
      message: 'Maximum balance must be greater than minimum balance'
    });
  }

  const accountType = new AccountType({
    name,
    code: code.toUpperCase(),
    description,
    minimumBalance,
    maximumBalance,
    interestRate,
    monthlyFee,
    transactionLimit,
    features
  });

  await accountType.save();

  res.status(201).json({
    success: true,
    message: 'Account type created successfully',
    data: { accountType }
  });
}));

// Update account type (admin only)
router.put('/:id', auth, authorize('admin'), updateAccountTypeValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const accountType = await AccountType.findById(req.params.id);
  
  if (!accountType) {
    return res.status(404).json({
      success: false,
      message: 'Account type not found'
    });
  }

  const {
    name,
    description,
    minimumBalance,
    maximumBalance,
    interestRate,
    monthlyFee,
    transactionLimit,
    features,
    isActive
  } = req.body;

  // Update fields if provided
  if (name !== undefined) accountType.name = name;
  if (description !== undefined) accountType.description = description;
  if (minimumBalance !== undefined) accountType.minimumBalance = minimumBalance;
  if (maximumBalance !== undefined) accountType.maximumBalance = maximumBalance;
  if (interestRate !== undefined) accountType.interestRate = interestRate;
  if (monthlyFee !== undefined) accountType.monthlyFee = monthlyFee;
  if (transactionLimit !== undefined) {
    accountType.transactionLimit = {
      ...accountType.transactionLimit,
      ...transactionLimit
    };
  }
  if (features !== undefined) accountType.features = features;
  if (isActive !== undefined) accountType.isActive = isActive;

  // Validate that maximum balance is greater than minimum balance
  if (accountType.maximumBalance <= accountType.minimumBalance) {
    return res.status(400).json({
      success: false,
      message: 'Maximum balance must be greater than minimum balance'
    });
  }

  await accountType.save();

  res.json({
    success: true,
    message: 'Account type updated successfully',
    data: { accountType }
  });
}));

// Delete account type (admin only)
router.delete('/:id', auth, authorize('admin'), asyncHandler(async (req, res) => {
  const { Account } = require('../models/Account');
  
  const accountType = await AccountType.findById(req.params.id);
  
  if (!accountType) {
    return res.status(404).json({
      success: false,
      message: 'Account type not found'
    });
  }

  // Check if any accounts are using this account type
  const accountsUsingType = await Account.countDocuments({ 
    accountType: req.params.id,
    status: { $ne: 'closed' }
  });

  if (accountsUsingType > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete account type. ${accountsUsingType} active accounts are using this type.`
    });
  }

  await AccountType.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Account type deleted successfully'
  });
}));

// Toggle account type status (admin only)
router.put('/:id/toggle-status', auth, authorize('admin'), asyncHandler(async (req, res) => {
  const accountType = await AccountType.findById(req.params.id);
  
  if (!accountType) {
    return res.status(404).json({
      success: false,
      message: 'Account type not found'
    });
  }

  accountType.isActive = !accountType.isActive;
  await accountType.save();

  res.json({
    success: true,
    message: `Account type ${accountType.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { accountType }
  });
}));

// Get account type statistics (admin only)
router.get('/stats/usage', auth, authorize('admin'), asyncHandler(async (req, res) => {
  const { Account } = require('../models/Account');
  
  const usage = await Account.aggregate([
    {
      $group: {
        _id: '$accountType',
        count: { $sum: 1 },
        totalBalance: { $sum: '$balance' },
        averageBalance: { $avg: '$balance' },
        activeAccounts: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        }
      }
    },
    {
      $lookup: {
        from: 'accounttypes',
        localField: '_id',
        foreignField: '_id',
        as: 'accountType'
      }
    },
    {
      $unwind: '$accountType'
    },
    {
      $project: {
        _id: 1,
        name: '$accountType.name',
        code: '$accountType.code',
        count: 1,
        totalBalance: { $round: ['$totalBalance', 2] },
        averageBalance: { $round: ['$averageBalance', 2] },
        activeAccounts: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get account types with no accounts
  const allAccountTypes = await AccountType.find({}, '_id name code');
  const usedTypes = usage.map(u => u._id.toString());
  const unusedTypes = allAccountTypes.filter(
    type => !usedTypes.includes(type._id.toString())
  );

  res.json({
    success: true,
    data: {
      usage,
      unusedTypes: unusedTypes.map(type => ({
        _id: type._id,
        name: type.name,
        code: type.code,
        count: 0,
        totalBalance: 0,
        averageBalance: 0,
        activeAccounts: 0
      }))
    }
  });
}));

// Get popular account types (public)
router.get('/stats/popular', asyncHandler(async (req, res) => {
  const { Account } = require('../models/Account');
  
  const popular = await Account.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: '$accountType',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'accounttypes',
        localField: '_id',
        foreignField: '_id',
        as: 'accountType'
      }
    },
    {
      $unwind: '$accountType'
    },
    {
      $match: { 'accountType.isActive': true }
    },
    {
      $project: {
        _id: '$accountType._id',
        name: '$accountType.name',
        code: '$accountType.code',
        description: '$accountType.description',
        features: '$accountType.features',
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  res.json({
    success: true,
    data: { popular }
  });
}));

module.exports = router;