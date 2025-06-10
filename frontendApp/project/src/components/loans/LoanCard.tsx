import React from 'react';
import { Link } from 'react-router-dom';
import { Loan } from '../../types';
import Card from '../ui/Card';

interface LoanCardProps {
  loan: Loan;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateProgress = () => {
    const paid = loan.amount - loan.remainingAmount;
    const progress = (paid / loan.amount) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getStatusColor = (status: Loan['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const progress = calculateProgress();
  const statusColor = getStatusColor(loan.status);

  return (
    <Card className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 capitalize">
              {loan.type} Loan
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(loan.startDate)} - {formatDate(loan.endDate)}
            </p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor} capitalize`}>
            {loan.status}
          </div>
        </div>
        
        <div className="space-y-4 flex-1">
          <div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-medium">{formatCurrency(loan.amount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Interest Rate</span>
              <span className="font-medium">{loan.interestRate}%</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Monthly Payment</span>
              <span className="font-medium">{formatCurrency(loan.monthlyPayment)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Term</span>
              <span className="font-medium">{loan.term} months</span>
            </div>
          </div>
          
          {(loan.status === 'active' || loan.status === 'completed') && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Remaining</span>
                <span className="font-medium">{formatCurrency(loan.remainingAmount)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{Math.round(progress)}% Paid</span>
                <span>{formatCurrency(loan.amount - loan.remainingAmount)} of {formatCurrency(loan.amount)}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Link
            to={`/loans/${loan.id}`}
            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default LoanCard;