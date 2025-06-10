import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  CreditCard,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../utils/mockData';
import { Account, Transaction } from '../types';
import Card from '../components/ui/Card';
import TransactionList from '../components/transactions/TransactionList';
import AccountCard from '../components/accounts/AccountCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch accounts
        const userAccounts = await mockApi.getAccounts(user.id);
        setAccounts(userAccounts);
        
        // Fetch recent transactions
        if (userAccounts.length > 0) {
          const firstAccountId = userAccounts[0].id;
          const transactions = await mockApi.getTransactions(firstAccountId);
          setRecentTransactions(transactions.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome message */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your finances
        </p>
      </div>
      
      {/* Financial summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100">Total Balance</p>
              <h3 className="text-3xl font-bold mt-1">{formatCurrency(getTotalBalance())}</h3>
              <p className="text-blue-200 text-sm mt-2">Across {accounts.length} accounts</p>
            </div>
            <Wallet className="h-10 w-10 text-blue-300" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100">Total Income</p>
              <h3 className="text-3xl font-bold mt-1">{formatCurrency(1250.00)}</h3>
              <p className="text-emerald-200 text-sm mt-2">This month</p>
            </div>
            <ArrowUpRight className="h-10 w-10 text-emerald-300" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-rose-500 to-rose-700 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-rose-100">Total Expenses</p>
              <h3 className="text-3xl font-bold mt-1">{formatCurrency(720.50)}</h3>
              <p className="text-rose-200 text-sm mt-2">This month</p>
            </div>
            <ArrowDownRight className="h-10 w-10 text-rose-300" />
          </div>
        </Card>
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
        <Link
          to="/transactions/new"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Transfer</span>
        </Link>
        
        <Link
          to="/transactions/new"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Deposit</span>
        </Link>
        
        <Link
          to="/transactions/new"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Withdraw</span>
        </Link>
        
        <Link
          to="/loans/new"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-2">
            <PiggyBank size={20} />
          </div>
          <span className="text-sm font-medium text-gray-900">Loan</span>
        </Link>
        
        <Link
          to="/cards"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2">
            <CreditCard size={20} />
          </div>
          <span className="text-sm font-medium text-gray-900">Cards</span>
        </Link>
        
        <Link
          to="/support"
          className="flex flex-col items-center justify-center p-4 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Support</span>
        </Link>
      </div>
      
      {/* Accounts and recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Accounts section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>
            <Link
              to="/accounts"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          
          {accounts.length === 0 ? (
            <Card>
              <div className="text-center py-6">
                <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any accounts yet.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {accounts.map(account => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          )}
        </div>
        
        {/* Recent transactions section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <Link
              to="/transactions"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
            </Link>
          </div>
          
          <Card>
            <TransactionList 
              transactions={recentTransactions}
              loading={isLoading}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;