const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Decimal = require('decimal.js');

// Account Type Schema
const accountTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Account type name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Account type name cannot exceed 50 characters']
  },
  code: {
    type: String,
    required: [true, 'Account type code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Account type code cannot exceed 10 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  minimumBalance: {
    type: Number,
    default: 0,
    min: [0, 'Minimum balance cannot be negative']
  },
  maximumBalance: {
    type: Number,
    default: 1000000,
    min: [0, 'Maximum balance cannot be negative']
  },
  interestRate: {
    type: Number,
    default: 0,
    min: [0, 'Interest rate cannot be negative'],
    max: [100, 'Interest rate cannot exceed 100%']
  },
  monthlyFee: {
    type: Number,
    default: 0,
    min: [0, 'Monthly fee cannot be negative']
  },
  transactionLimit: {
    daily: {
      type: Number,
      default: 10000,
      min: [0, 'Daily transaction limit cannot be negative']
    },
    monthly: {
      type: Number,
      default: 50000,
      min: [0, 'Monthly transaction limit cannot be negative']
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Account Schema
const accountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    unique: true,
    trim: true,
    minlength: [10, 'Account number must be at least 10 characters'],
    maxlength: [20, 'Account number cannot exceed 20 characters']
  },
  accountType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AccountType',
    required: [true, 'Account type is required']
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative'],
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(v.toFixed(2))
  },
  availableBalance: {
    type: Number,
    default: 0,
    min: [0, 'Available balance cannot be negative'],
    get: v => parseFloat(v.toFixed(2)),
    set: v => parseFloat(v.toFixed(2))
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'closed', 'pending'],
    default: 'pending'
  },
  branch: {
    code: {
      type: String,
      required: [true, 'Branch code is required'],
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  overdraftLimit: {
    type: Number,
    default: 0,
    min: [0, 'Overdraft limit cannot be negative']
  },
  overdraftUsed: {
    type: Number,
    default: 0,
    min: [0, 'Overdraft used cannot be negative']
  },
  lastTransactionDate: {
    type: Date
  },
  monthlyStatementDate: {
    type: Number,
    min: [1, 'Statement date must be between 1 and 31'],
    max: [31, 'Statement date must be between 1 and 31'],
    default: 1
  },
  notifications: {
    lowBalance: {
      enabled: {
        type: Boolean,
        default: true
      },
      threshold: {
        type: Number,
        default: 100,
        min: [0, 'Low balance threshold cannot be negative']
      }
    },
    largeTransaction: {
      enabled: {
        type: Boolean,
        default: true
      },
      threshold: {
        type: Number,
        default: 1000,
        min: [0, 'Large transaction threshold cannot be negative']
      }
    }
  },
  metadata: {
    openingDeposit: {
      type: Number,
      min: [0, 'Opening deposit cannot be negative']
    },
    openedBy: {
      type: String,
      trim: true
    },
    closedBy: {
      type: String,
      trim: true
    },
    closedAt: {
      type: Date
    },
    closureReason: {
      type: String,
      trim: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: {
    getters: true,
    transform: function(doc, ret) {
      ret.balance = parseFloat(ret.balance.toFixed(2));
      ret.availableBalance = parseFloat(ret.availableBalance.toFixed(2));
      return ret;
    }
  }
});

// Indexes
accountSchema.index({ userId: 1 });
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ status: 1 });
accountSchema.index({ accountType: 1 });
accountSchema.index({ 'branch.code': 1 });
accountSchema.index({ createdAt: -1 });

accountTypeSchema.index({ code: 1 });
accountTypeSchema.index({ name: 1 });
accountTypeSchema.index({ isActive: 1 });

// Virtual for overdraft available
accountSchema.virtual('overdraftAvailable').get(function() {
  return this.overdraftLimit - this.overdraftUsed;
});

// Virtual for total available funds
accountSchema.virtual('totalAvailableFunds').get(function() {
  return this.availableBalance + this.overdraftAvailable;
});

// Pre-save middleware to generate account number
accountSchema.pre('save', async function(next) {
  if (!this.accountNumber) {
    const accountType = await mongoose.model('AccountType').findById(this.accountType);
    if (accountType) {
      // Generate account number: BRANCH_CODE + ACCOUNT_TYPE_CODE + RANDOM_DIGITS
      const randomDigits = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      this.accountNumber = `${this.branch.code}${accountType.code}${randomDigits}`;
    }
  }
  next();
});

// Method to check if account can be debited
accountSchema.methods.canDebit = function(amount) {
  const totalAvailable = this.availableBalance + this.overdraftAvailable;
  return totalAvailable >= amount;
};

// Method to update balance
accountSchema.methods.updateBalance = async function(amount, type = 'credit') {
  if (type === 'credit') {
    this.balance += amount;
    this.availableBalance += amount;
  } else if (type === 'debit') {
    if (!this.canDebit(amount)) {
      throw new Error('Insufficient funds');
    }
    
    this.balance -= amount;
    this.availableBalance -= amount;
    
    // Handle overdraft
    if (this.availableBalance < 0) {
      this.overdraftUsed += Math.abs(this.availableBalance);
      this.availableBalance = 0;
    }
  }
  
  this.lastTransactionDate = new Date();
  return this.save();
};

// Method to check minimum balance requirement
accountSchema.methods.checkMinimumBalance = async function() {
  const accountType = await mongoose.model('AccountType').findById(this.accountType);
  if (accountType && this.balance < accountType.minimumBalance) {
    return {
      isViolated: true,
      required: accountType.minimumBalance,
      current: this.balance,
      shortage: accountType.minimumBalance - this.balance
    };
  }
  return { isViolated: false };
};

// Method to calculate interest
accountSchema.methods.calculateInterest = async function(days = 30) {
  const accountType = await mongoose.model('AccountType').findById(this.accountType);
  if (!accountType || accountType.interestRate === 0) {
    return 0;
  }
  
  const dailyRate = accountType.interestRate / 100 / 365;
  return this.balance * dailyRate * days;
};

// Static method to generate unique account number
accountSchema.statics.generateAccountNumber = async function(branchCode, accountTypeCode) {
  let accountNumber;
  let exists = true;
  
  while (exists) {
    const randomDigits = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    accountNumber = `${branchCode}${accountTypeCode}${randomDigits}`;
    
    const existing = await this.findOne({ accountNumber });
    exists = !!existing;
  }
  
  return accountNumber;
};

const Account = mongoose.model('Account', accountSchema);
const AccountType = mongoose.model('AccountType', accountTypeSchema);

module.exports = { Account, AccountType };