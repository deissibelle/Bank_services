import React from 'react';
import { Link } from 'react-router-dom';
import { Account } from '../../types';
import Card from '../ui/Card';

interface AccountCardProps {
  account: Account;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const accountTypeInfo = {
    checking: {
      title: 'Checking Account',
      color: 'bg-blue-500',
      icon: (
        <svg className="h-6 w-6 text-white\" fill="none\" viewBox="0 0 24 24\" stroke="currentColor">
          <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    savings: {
      title: 'Savings Account',
      color: 'bg-emerald-500',
      icon: (
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const info = accountTypeInfo[account.type];

  return (
    <Card
      className="h-full transition-transform duration-200 hover:scale-[1.02]"
      hoverable
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-md ${info.color}`}>
            {info.icon}
          </div>
          <div className="text-right">
            <h3 className="text-lg font-medium text-gray-900">{info.title}</h3>
            <p className="text-sm text-gray-500">**** {account.accountNumber.slice(-4)}</p>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="mb-2">
            <span className="text-sm text-gray-500">Available Balance</span>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(account.balance)}</p>
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            <p>IBAN: {account.iban.slice(0, 4)}...{account.iban.slice(-4)}</p>
            <p>Created: {new Date(account.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex justify-between space-x-2 mt-4">
          <Link
            to={`/accounts/${account.id}`}
            className="flex-1 text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Details
          </Link>
          <Link
            to={`/transactions/new?accountId=${account.id}`}
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Transaction
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default AccountCard;