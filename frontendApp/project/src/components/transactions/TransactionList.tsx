import React from 'react';
import { Transaction } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  loading = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionTypeStyles = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: (
            <svg className="h-5 w-5 text-green-500\" fill="none\" viewBox="0 0 24 24\" stroke="currentColor">
              <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          )
        };
      case 'withdrawal':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          )
        };
      case 'transfer':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: (
            <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          )
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: (
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )
        };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center py-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-6">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't made any transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {transactions.map((transaction) => {
        const { bgColor, textColor, icon } = getTransactionTypeStyles(transaction.type);
        const isPositive = transaction.type === 'deposit';
        
        return (
          <div key={transaction.id} className="py-4 flex items-center space-x-4 hover:bg-gray-50 px-2 rounded transition-colors">
            <div className={`p-2 rounded-full ${bgColor}`}>
              {icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {transaction.description}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="truncate">
                  {formatDate(transaction.date)}
                </span>
                {transaction.recipientName && (
                  <span className="ml-2 truncate">
                    • To: {transaction.recipientName}
                  </span>
                )}
              </div>
            </div>
            
            <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;