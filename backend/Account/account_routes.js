const express = require('express');
const { body, validationResult } = require('express-validator');
const { Account, AccountType } = require('../models/Account');
const { 
  auth, 
  authorize, 
  checkAccountOwnership, 
  asyncHandler, 
  checkAccountStatus,
  validateTransactionAmount 
} = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createAccountValidation = [
  body('accountType').isMongoId().withMessage('Valid account type ID is required'),
  body('branchCode').trim().isLength({ min: 3, max: 10 }).withMessage('Branch code must be 3-10 characters'),
  body('branchName').trim().isLength({ min: 2, max: 100 }).withMessage('Branch name must be 2-100 characters'),
  body('branchAddress').optional().trim().isLength({ max: 200 }),
  body('openingDeposit').optional().isFloat({ min: 0 }).withMessage('Opening deposit must be non-negative'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD']).withMessage('Invalid currency'),
  body('monthlyStatementDate').optional().isInt({ min: 1, max: 31 })
];

const updateAccountValidation = [
  body('monthlyStatementDate').optional().isInt({ min: 1, max: 31 }),
  body('overdraftLimit').optional().isFloat({ min: 0 }),
  body('notifications.lowBalance.enabled').optional().isBoolean(),
  body('notifications.lowBalance.threshold').optional().isFloat({ min: 0 }),
  body('notifications.largeTransaction.enabled').optional().isBoolean(),
  body('notifications.largeTransaction.threshold').optional().isFloat({ min: 0 })
];

// Get all accounts for user
router.get('/', auth, asyncHandler(async (req, res) => {
  const { status, accountType, page = 1, limit = 10 } = req.query;
  
  const query = { userId: req.user._id };
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by account type
  if (accountType) {
    query.accountType = accountType;
  }

  const accounts = await Account.find(query)
    .populate('accountType', 'name code description')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Account.countDocuments(query);

  res.json({
    success: true,
    data: {
      accounts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// Get all accounts (admin/support only)
router.get('/all', auth, authorize('admin', 'support'), asyncHandler(async (req, res) => {
  const { 
    status, 
    accountType, 
    branchCode, 
    userId,
    page = 1, 
    limit = 10,
    search 
  } = req.query;
  
  const query = {};
  
  // Filter by status
  if (status) {
    query.status = status;
  }
  
  // Filter by account type
  if (accountType) {
    query.accountType = accountType;
  }
  
  // Filter by branch
  if (branchCode) {
    query['branch.code'] = branchCode;
  }
  
  // Filter by user
  if (userId) {
    query.userId = userId;
  }
  
  // Search by account number
  if (search) {
    query.accountNumber = { $regex: search, $options: 'i' };
  }

  const accounts = await Account.find(query)
    .populate('accountType', 'name code description')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Account.countDocuments(query);

  res.json({
    success: true,
    data: {
      accounts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// Create new account
router.post('/', auth, createAccountValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    accountType,
    branchCode,
    branchName,
    branchAddress,
    openingDeposit = 0,
    currency = 'USD',
    monthlyStatementDate = 1
  } = req.body;

  // Verify account type exists and is active
  const accountTypeDoc = await AccountType.findById(accountType);
  if (!accountTypeDoc || !accountTypeDoc.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or inactive account type'
    });
  }

  // Check minimum opening deposit
  if (openingDeposit < accountTypeDoc.minimumBalance) {
    return res.status(400).json({
      success: false,
      message: `Minimum opening deposit is ${accountTypeDoc.minimumBalance}`
    });
  }

  // Generate unique account number
  const accountNumber = await Account.generateAccountNumber(branchCode, accountTypeDoc.code);

  const account = new Account({
    accountNumber,
    accountType,
    userId: req.user._id,
    balance: openingDeposit,
    availableBalance: openingDeposit,
    currency,
    status: 'active',
    branch: {
      code: branchCode.toUpperCase(),
      name: branchName,
      address: branchAddress
    },
    monthlyStatementDate,
    metadata: {
      openingDeposit,
      openedBy: req.user._id
    }
  });

  await account.save();
  await account.populate('accountType', 'name code description');

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { account }
  });
}));

// Get account by ID
router.get('/:id', auth, checkAccountOwnership, asyncHandler(async (req, res) => {
  await req.account.populate('accountType', 'name code description interestRate monthlyFee');

  res.json({
    success: true,
    data: { account: req.account }
  });
}));

// Update account settings
router.put('/:id', auth, checkAccountOwnership, updateAccountValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const {
    monthlyStatementDate,
    overdraftLimit,
    notifications
  } = req.body;

  const account = req.account;

  if (monthlyStatementDate !== undefined) {
    account.monthlyStatementDate = monthlyStatementDate;
  }

  if (overdraftLimit !== undefined) {
    account.overdraftLimit = overdraftLimit;
  }

  if (notifications) {
    if (notifications.lowBalance) {
      account.notifications.lowBalance = {
        ...account.notifications.lowBalance,
        ...notifications.lowBalance
      };
    }
    if (notifications.largeTransaction) {
      account.notifications.largeTransaction = {
        ...account.notifications.largeTransaction,
        ...notifications.largeTransaction
      };
    }
  }

  await account.save();
  await account.populate('accountType', 'name code description');

  res.json({
    success: true,
    message: 'Account updated successfully',
    data: { account }
  });
}));

// Get account balance
router.get('/:id/balance', auth, checkAccountOwnership, asyncHandler(async (req, res) => {
  const account = req.account;

  res.json({
    success: true,
    data: {
      balance: account.balance,
      availableBalance: account.availableBalance,
      overdraftLimit: account.overdraftLimit,
      overdraftUsed: account.overdraftUsed,
      overdraftAvailable: account.overdraftAvailable,
      totalAvailableFunds: account.totalAvailableFunds,
      currency: account.currency,
      lastUpdated: account.updatedAt
    }
  });
}));

// Update account balance (admin only - for manual adjustments)
router.put('/:id/balance', auth, authorize('admin'), checkAccountOwnership, [
  body('amount').isFloat().withMessage('Amount must be a valid number'),
  body('type').isIn(['credit', 'debit']).withMessage('Type must be credit or debit'),
  body('reason').trim().isLength({ min: 5, max: 200 }).withMessage('Reason must be 5-200 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { amount, type, reason } = req.body;
  const account = req.account;

  try {
    await account.updateBalance(amount, type);

    // Log the manual adjustment (in production, this would go to an audit trail)
    console.log(`Manual balance adjustment: Account ${account.accountNumber}, ${type} ${amount}, Reason: ${reason}, By: ${req.user._id}`);

    res.json({
      success: true,
      message: 'Balance updated successfully',
      data: {
        newBalance: account.balance,
        newAvailableBalance: account.availableBalance
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}));

// Close account
router.put('/:id/close', auth, checkAccountOwnership, [
  body('reason').trim().isLength({ min: 5, max: 200 }).withMessage('Closure reason must be 5-200 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { reason } = req.body;
  const account = req.account;

  // Check if account can be closed
  if (account.status === 'closed') {
    return res.status(400).json({
      success: false,
      message: 'Account is already closed'
    });
  }

  if (account.balance !== 0) {
    return res.status(400).json({
      success: false,
      message: 'Account balance must be zero before closing'
    });
  }

  if (account.overdraftUsed > 0) {
    return res.status(400).json({
      success: false,
      message: 'Outstanding overdraft must be cleared before closing'
    });
  }

  account.status = 'closed';
  account.metadata.closedAt = new Date();
  account.metadata.closedBy = req.user._id;
  account.metadata.closureReason = reason;

  await account.save();

  res.json({
    success: true,
    message: 'Account closed successfully',
    data: { account }
  });
}));

// Reactivate account (admin only)
router.put('/:id/reactivate', auth, authorize('admin'), checkAccountOwnership, asyncHandler(async (req, res) => {
  const account = req.account;

  if (account.status !== 'closed' && account.status !== 'suspended') {
    return res.status(400).json({
      success: false,
      message: 'Only closed or suspended accounts can be reactivated'
    });
  }

  account.status = 'active';
  account.metadata.closedAt = undefined;
  account.metadata.closedBy = undefined;
  account.metadata.closureReason = undefined;

  await account.save();

  res.json({
    success: true,
    message: 'Account reactivated successfully',
    data: { account }
  });
}));

// Update account status (admin only)
router.put('/:id/status', auth, authorize('admin'), checkAccountOwnership, [
  body('status').isIn(['active', 'inactive', 'suspended', 'closed']).withMessage('Invalid status'),
  body('reason').optional().trim().isLength({ max: 200 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { status, reason } = req.body;
  const account = req.account;

  account.status = status;

  if (status === 'closed') {
    account.metadata.closedAt = new Date();
    account.metadata.closedBy = req.user._id;
    account.metadata.closureReason = reason;
  }

  await account.save();

  res.json({
    success: true,
    message: 'Account status updated successfully',
    data: { account }
  });
}));

// Get account statement/summary
router.get('/:id/statement', auth, checkAccountOwnership, asyncHandler(async (req, res) => {
  const { from, to, includeMinBalance } = req.query;
  const account = req.account;

  // Calculate interest if applicable
  const interestEarned = await account.calculateInterest(30);
  
  // Check minimum balance compliance
  const minBalanceCheck = await account.checkMinimumBalance();

  const statement = {
    account: {
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      availableBalance: account.availableBalance,
      currency: account.currency
    },
    period: {
      from: from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: to || new Date()
    },
    interestEarned: interestEarned,
    minBalanceCheck: includeMinBalance ? minBalanceCheck : undefined,
    overdraft: {
      limit: account.overdraftLimit,
      used: account.overdraftUsed,
      available: account.overdraftAvailable
    },
    lastTransactionDate: account.lastTransactionDate
  };

  res.json({
    success: true,
    data: { statement }
  });
}));

// Get account statistics (admin only)
router.get('/stats/overview', auth, authorize('admin'), asyncHandler(async (req, res) => {
  const totalAccounts = await Account.countDocuments();
  const activeAccounts = await Account.countDocuments({ status: 'active' });
  const closedAccounts = await Account.countDocuments({ status: 'closed' });
  const suspendedAccounts = await Account.countDocuments({ status: 'suspended' });

  const totalBalance = await Account.aggregate([
    { $match: { status: { $ne: 'closed' } } },
    { $group: { _id: null, total: { $sum: '$balance' } } }
  ]);

  const accountsByType = await Account.aggregate([
    { $match: { status: { $ne: 'closed' } } },
    {
      $lookup: {
        from: 'accounttypes',
        localField: 'accountType',
        foreignField: '_id',
        as: 'type'
      }
    },
    { $unwind: '$type' },
    {
      $group: {
        _id: '$type.name',
        count: { $sum: 1 },
        totalBalance: { $sum: '$balance' }
      }
    }
  ]);

  const accountsByBranch = await Account.aggregate([
    { $match: { status: { $ne: 'closed' } } },
    {
      $group: {
        _id: '$branch.code',
        branchName: { $first: '$branch.name' },
        count: { $sum: 1 },
        totalBalance: { $sum: '$balance' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        total: totalAccounts,
        active: activeAccounts,
        closed: closedAccounts,
        suspended: suspendedAccounts,
        totalBalance: totalBalance[0]?.total || 0
      },
      byType: accountsByType,
      byBranch: accountsByBranch
    }
  });
}));

module.exports = router;