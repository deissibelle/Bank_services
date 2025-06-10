// MongoDB initialization script for Account Service
db = db.getSiblingDB('banking_accounts');

// Create indexes for better performance
// Account indexes
db.accounts.createIndex({ "accountNumber": 1 }, { unique: true });
db.accounts.createIndex({ "userId": 1 });
db.accounts.createIndex({ "status": 1 });
db.accounts.createIndex({ "accountType": 1 });
db.accounts.createIndex({ "branch.code": 1 });
db.accounts.createIndex({ "createdAt": -1 });
db.accounts.createIndex({ "lastTransactionDate": -1 });
db.accounts.createIndex({ "balance": 1 });

// Account Type indexes
db.accounttypes.createIndex({ "code": 1 }, { unique: true });
db.accounttypes.createIndex({ "name": 1 }, { unique: true });
db.accounttypes.createIndex({ "isActive": 1 });

// Create default account types
const defaultAccountTypes = [
  {
    name: "Savings Account",
    code: "SAV",
    description: "Standard savings account with competitive interest rates",
    minimumBalance: 100,
    maximumBalance: 100000,
    interestRate: 2.5,
    monthlyFee: 0,
    transactionLimit: {
      daily: 5000,
      monthly: 20000
    },
    features: [
      "Online banking",
      "Mobile banking",
      "ATM access",
      "Interest earning",
      "No monthly fees"
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Checking Account",
    code: "CHK",
    description: "Everyday checking account for daily transactions",
    minimumBalance: 25,
    maximumBalance: 50000,
    interestRate: 0.1,
    monthlyFee: 5,
    transactionLimit: {
      daily: 10000,
      monthly: 50000
    },
    features: [
      "Unlimited transactions",
      "Debit card included",
      "Online banking",
      "Mobile deposits",
      "Bill pay service",
      