import { User, Account, Transaction, Card, Loan, Message, ReportData } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'client',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'client',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '3',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@bankapp.com',
    role: 'admin',
    avatarUrl: 'https://images.pexels.com/photos/3760824/pexels-photo-3760824.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    id: '4',
    firstName: 'Employee',
    lastName: 'Support',
    email: 'support@bankapp.com',
    role: 'employee',
    avatarUrl: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];

// Mock Accounts
export const accounts: Account[] = [
  {
    id: '1',
    userId: '1',
    type: 'checking',
    balance: 2500.75,
    accountNumber: '123456789',
    iban: 'FR7630001007941234567890185',
    createdAt: '2022-01-15T10:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'savings',
    balance: 15000.50,
    accountNumber: '987654321',
    iban: 'FR7630001007949876543210185',
    createdAt: '2022-01-15T10:35:00Z'
  },
  {
    id: '3',
    userId: '2',
    type: 'checking',
    balance: 3200.25,
    accountNumber: '456789123',
    iban: 'FR7630001007944567891230185',
    createdAt: '2022-02-20T14:20:00Z'
  },
  {
    id: '4',
    userId: '2',
    type: 'savings',
    balance: 8500.00,
    accountNumber: '789123456',
    iban: 'FR7630001007947891234560185',
    createdAt: '2022-02-20T14:25:00Z'
  }
];

// Mock Transactions
export const transactions: Transaction[] = [
  {
    id: '1',
    accountId: '1',
    type: 'deposit',
    amount: 1000.00,
    description: 'Salary payment',
    date: '2023-05-05T09:20:00Z',
    status: 'completed'
  },
  {
    id: '2',
    accountId: '1',
    type: 'withdrawal',
    amount: 150.00,
    description: 'ATM withdrawal',
    date: '2023-05-10T14:30:00Z',
    status: 'completed'
  },
  {
    id: '3',
    accountId: '1',
    type: 'transfer',
    amount: 500.00,
    description: 'Transfer to savings',
    recipientId: '2',
    recipientName: 'John Doe (Savings)',
    date: '2023-05-12T11:45:00Z',
    status: 'completed'
  },
  {
    id: '4',
    accountId: '2',
    type: 'deposit',
    amount: 500.00,
    description: 'Transfer from checking',
    date: '2023-05-12T11:45:00Z',
    status: 'completed'
  },
  {
    id: '5',
    accountId: '3',
    type: 'deposit',
    amount: 2000.00,
    description: 'Salary payment',
    date: '2023-05-05T10:15:00Z',
    status: 'completed'
  },
  {
    id: '6',
    accountId: '3',
    type: 'withdrawal',
    amount: 300.00,
    description: 'Online purchase',
    date: '2023-05-08T16:20:00Z',
    status: 'completed'
  }
];

// Mock Cards
export const cards: Card[] = [
  {
    id: '1',
    accountId: '1',
    cardNumber: '****-****-****-1234',
    cardholderName: 'John Doe',
    expiryDate: '12/25',
    type: 'debit',
    status: 'active'
  },
  {
    id: '2',
    accountId: '2',
    cardNumber: '****-****-****-5678',
    cardholderName: 'John Doe',
    expiryDate: '09/26',
    type: 'credit',
    status: 'active',
    limit: 5000
  },
  {
    id: '3',
    accountId: '3',
    cardNumber: '****-****-****-9012',
    cardholderName: 'Jane Smith',
    expiryDate: '03/27',
    type: 'debit',
    status: 'active'
  }
];

// Mock Loans
export const loans: Loan[] = [
  {
    id: '1',
    userId: '1',
    type: 'personal',
    amount: 10000.00,
    interestRate: 5.5,
    term: 24, // 2 years
    monthlyPayment: 440.45,
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2025-01-15T00:00:00Z',
    status: 'active',
    remainingAmount: 7543.60
  },
  {
    id: '2',
    userId: '2',
    type: 'mortgage',
    amount: 200000.00,
    interestRate: 3.2,
    term: 300, // 25 years
    monthlyPayment: 869.50,
    startDate: '2022-05-10T00:00:00Z',
    endDate: '2047-05-10T00:00:00Z',
    status: 'active',
    remainingAmount: 194782.75
  },
  {
    id: '3',
    userId: '1',
    type: 'personal',
    amount: 5000.00,
    interestRate: 4.9,
    term: 12,
    monthlyPayment: 430.33,
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2024-06-01T00:00:00Z',
    status: 'pending',
    remainingAmount: 5000.00
  }
];

// Mock Messages
export const messages: Message[] = [
  {
    id: '1',
    userId: '1',
    supportId: '4',
    content: 'Hello, I have a question about my recent transaction.',
    timestamp: '2023-05-15T14:30:00Z',
    isUser: true
  },
  {
    id: '2',
    userId: '1',
    supportId: '4',
    content: 'Hi John, I\'m happy to help. Can you provide more details about the transaction?',
    timestamp: '2023-05-15T14:32:00Z',
    isUser: false
  },
  {
    id: '3',
    userId: '1',
    supportId: '4',
    content: 'Yes, it was a withdrawal on May 10th that I don\'t recognize.',
    timestamp: '2023-05-15T14:33:00Z',
    isUser: true
  },
  {
    id: '4',
    userId: '1',
    supportId: '4',
    content: 'Let me check that for you. Give me a moment please.',
    timestamp: '2023-05-15T14:34:00Z',
    isUser: false
  }
];

// Mock Report Data
export const reportData: ReportData = {
  totalClients: 250,
  totalAccounts: 380,
  totalDeposits: 1250000,
  totalWithdrawals: 780000,
  totalLoans: 4500000,
  activeCards: 320,
  monthlyTransactions: [
    { month: 'Jan', count: 1250, volume: 450000 },
    { month: 'Feb', count: 1380, volume: 520000 },
    { month: 'Mar', count: 1420, volume: 530000 },
    { month: 'Apr', count: 1350, volume: 490000 },
    { month: 'May', count: 1500, volume: 550000 },
    { month: 'Jun', count: 1580, volume: 580000 }
  ]
};

// Mock API functions
export const mockApi = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email (in a real app, this would validate the password too)
    const user = users.find(u => u.email === email);
    
    if (user && password === 'password') {
      return user;
    }
    
    return null;
  },
  
  signup: async (userData: Partial<User>, password: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new user (in a real app, this would hash the password)
    const newUser: User = {
      id: uuidv4(),
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      role: 'client',
      avatarUrl: userData.avatarUrl
    };
    
    return newUser;
  },
  
  getAccounts: async (userId: string): Promise<Account[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return accounts.filter(account => account.userId === userId);
  },
  
  getTransactions: async (accountId: string): Promise<Transaction[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return transactions.filter(transaction => transaction.accountId === accountId);
  },
  
  createTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newTransaction: Transaction = {
      id: uuidv4(),
      accountId: transaction.accountId || '',
      type: transaction.type || 'deposit',
      amount: transaction.amount || 0,
      description: transaction.description || '',
      recipientId: transaction.recipientId,
      recipientName: transaction.recipientName,
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    return newTransaction;
  },
  
  getCards: async (userId: string): Promise<Card[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get user accounts
    const userAccounts = accounts.filter(account => account.userId === userId);
    const userAccountIds = userAccounts.map(account => account.id);
    
    // Get cards for those accounts
    return cards.filter(card => userAccountIds.includes(card.accountId));
  },
  
  updateCardStatus: async (cardId: string, status: 'active' | 'blocked'): Promise<Card> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find card
    const card = cards.find(c => c.id === cardId);
    if (!card) {
      throw new Error('Card not found');
    }
    
    // Update status
    const updatedCard = { ...card, status };
    
    return updatedCard;
  },
  
  getLoans: async (userId: string): Promise<Loan[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return loans.filter(loan => loan.userId === userId);
  },
  
  applyForLoan: async (loanData: Partial<Loan>): Promise<Loan> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newLoan: Loan = {
      id: uuidv4(),
      userId: loanData.userId || '',
      type: loanData.type || 'personal',
      amount: loanData.amount || 0,
      interestRate: loanData.type === 'personal' ? 5.9 : 3.5,
      term: loanData.term || 0,
      monthlyPayment: 0, // This would be calculated based on amount, term and interest rate
      startDate: new Date().toISOString(),
      endDate: '', // This would be calculated based on start date and term
      status: 'pending',
      remainingAmount: loanData.amount || 0
    };
    
    // Simplified calculation for monthly payment
    const principal = newLoan.amount;
    const interest = newLoan.interestRate / 100 / 12;
    const payments = newLoan.term;
    newLoan.monthlyPayment = Number((principal * interest * Math.pow(1 + interest, payments) / (Math.pow(1 + interest, payments) - 1)).toFixed(2));
    
    // Calculate end date
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + newLoan.term);
    newLoan.endDate = endDate.toISOString();
    
    return newLoan;
  },
  
  getMessages: async (userId: string): Promise<Message[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return messages.filter(message => message.userId === userId);
  },
  
  sendMessage: async (message: Partial<Message>): Promise<Message> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newMessage: Message = {
      id: uuidv4(),
      userId: message.userId || '',
      supportId: message.supportId,
      content: message.content || '',
      timestamp: new Date().toISOString(),
      isUser: message.isUser || true
    };
    
    // Simulate automated response after 1 second
    setTimeout(() => {
      const autoResponse: Message = {
        id: uuidv4(),
        userId: newMessage.userId,
        supportId: '4', // Support employee ID
        content: 'Thank you for your message. A support agent will get back to you shortly.',
        timestamp: new Date(Date.now() + 1000).toISOString(),
        isUser: false
      };
      
      // In a real app, this would be handled by websockets or push notifications
      console.log('Auto response:', autoResponse);
    }, 1000);
    
    return newMessage;
  },
  
  getReportData: async (): Promise<ReportData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return reportData;
  }
};