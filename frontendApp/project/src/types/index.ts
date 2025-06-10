// Types for the banking application

// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'client' | 'employee' | 'admin';
  avatarUrl?: string;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Account types
export interface Account {
  id: string;
  userId: string;
  type: 'savings' | 'checking';
  balance: number;
  accountNumber: string;
  iban: string;
  createdAt: string;
}

// Transaction types
export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  description: string;
  recipientId?: string;
  recipientName?: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
}

// Card types
export interface Card {
  id: string;
  accountId: string;
  cardNumber: string; // masked except last 4 digits
  cardholderName: string;
  expiryDate: string;
  type: 'debit' | 'credit';
  status: 'active' | 'blocked' | 'expired';
  limit?: number;
}

// Loan types
export interface Loan {
  id: string;
  userId: string;
  type: 'personal' | 'mortgage';
  amount: number;
  interestRate: number;
  term: number; // in months
  monthlyPayment: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  remainingAmount: number;
}

// Support message types
export interface Message {
  id: string;
  userId: string;
  supportId?: string;
  content: string;
  timestamp: string;
  isUser: boolean;
}

// Report data types
export interface ReportData {
  totalClients: number;
  totalAccounts: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalLoans: number;
  activeCards: number;
  monthlyTransactions: {
    month: string;
    count: number;
    volume: number;
  }[];
}