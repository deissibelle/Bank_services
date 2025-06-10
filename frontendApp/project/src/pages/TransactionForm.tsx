import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../utils/mockData';
import { Account, Transaction } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const TransactionForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const accountIdFromUrl = queryParams.get('accountId');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    transactionType: 'deposit',
    accountId: accountIdFromUrl || '',
    amount: '',
    description: '',
    recipientId: '',
    recipientName: '',
    recipientAccount: ''
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userAccounts = await mockApi.getAccounts(user.id);
        setAccounts(userAccounts);
        
        if (!formData.accountId && userAccounts.length > 0) {
          setFormData(prev => ({ ...prev, accountId: userAccounts[0].id }));
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError('Failed to load accounts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAccounts();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, transactionType: type }));
  };

  const validateForm = () => {
    if (!formData.accountId) {
      setError('Please select an account');
      return false;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (!formData.description) {
      setError('Please enter a description');
      return false;
    }
    
    if (formData.transactionType === 'transfer') {
      if (!formData.recipientAccount) {
        setError('Please enter a recipient account number');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create transaction
      const transactionData: Partial<Transaction> = {
        accountId: formData.accountId,
        type: formData.transactionType as 'deposit' | 'withdrawal' | 'transfer',
        amount: Number(formData.amount),
        description: formData.description,
      };
      
      if (formData.transactionType === 'transfer') {
        transactionData.recipientId = formData.recipientAccount;
        transactionData.recipientName = formData.recipientName || 'External Account';
      }
      
      await mockApi.createTransaction(transactionData);
      
      setSuccess(`${formData.transactionType.charAt(0).toUpperCase() + formData.transactionType.slice(1)} completed successfully!`);
      
      // Reset form
      setFormData({
        ...formData,
        amount: '',
        description: '',
        recipientId: '',
        recipientName: '',
        recipientAccount: ''
      });
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/accounts');
      }, 2000);
    } catch (error) {
      console.error('Error creating transaction:', error);
      setError('Failed to process transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          New Transaction
        </h1>
        <p className="text-gray-600 mt-1">
          Create a new deposit, withdrawal, or transfer
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          {error && (
            <Alert
              type="error"
              title="Error"
              onClose={() => setError(null)}
              className="mb-6"
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert
              type="success"
              title="Success"
              onClose={() => setSuccess(null)}
              className="mb-6"
            >
              {success}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Transaction type selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange('deposit')}
                  className={`
                    flex items-center justify-center p-4 rounded-lg border-2
                    ${formData.transactionType === 'deposit'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:bg-gray-50'}
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                      <ArrowUpRight size={20} />
                    </div>
                    <span className="font-medium">Deposit</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleTypeChange('withdrawal')}
                  className={`
                    flex items-center justify-center p-4 rounded-lg border-2
                    ${formData.transactionType === 'withdrawal'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:bg-gray-50'}
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 rounded-full bg-red-100 text-red-600">
                      <ArrowDownRight size={20} />
                    </div>
                    <span className="font-medium">Withdraw</span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleTypeChange('transfer')}
                  className={`
                    flex items-center justify-center p-4 rounded-lg border-2
                    ${formData.transactionType === 'transfer'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'}
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      <ArrowRight size={20} />
                    </div>
                    <span className="font-medium">Transfer</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* From account */}
            <div className="mb-6">
              <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
                From Account
              </label>
              <select
                id="accountId"
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.type.charAt(0).toUpperCase() + account.type.slice(1)} - {account.accountNumber} (${account.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Amount */}
            <Input
              id="amount"
              name="amount"
              type="number"
              label="Amount"
              value={formData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
              fullWidth
            />
            
            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter a description for this transaction"
                required
              />
            </div>
            
            {/* Recipient details (for transfers) */}
            {formData.transactionType === 'transfer' && (
              <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-900">Recipient Details</h3>
                
                <Input
                  id="recipientAccount"
                  name="recipientAccount"
                  label="Account Number"
                  value={formData.recipientAccount}
                  onChange={handleChange}
                  placeholder="Enter recipient account number"
                  required
                  fullWidth
                />
                
                <Input
                  id="recipientName"
                  name="recipientName"
                  label="Recipient Name (Optional)"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="Enter recipient name"
                  fullWidth
                />
              </div>
            )}
            
            {/* Submit button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/accounts')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isLoading}
              >
                {formData.transactionType === 'deposit'
                  ? 'Make Deposit'
                  : formData.transactionType === 'withdrawal'
                    ? 'Withdraw Funds'
                    : 'Send Transfer'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TransactionForm;