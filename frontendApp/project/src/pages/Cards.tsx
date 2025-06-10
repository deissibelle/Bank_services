import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockApi } from '../utils/mockData';
import { Card as CardType } from '../types';
import BankCard from '../components/cards/BankCard';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

const Cards: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const userCards = await mockApi.getCards(user.id);
        setCards(userCards);
      } catch (error) {
        console.error('Error fetching cards:', error);
        setError('Failed to load cards. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCards();
  }, [user]);

  const handleBlockCard = async (cardId: string) => {
    try {
      const updatedCard = await mockApi.updateCardStatus(cardId, 'blocked');
      
      // Update cards list
      setCards(cards.map(card => 
        card.id === cardId ? updatedCard : card
      ));
      
      setNotification({
        type: 'success',
        message: 'Card has been blocked successfully.'
      });
    } catch (error) {
      console.error('Error blocking card:', error);
      setNotification({
        type: 'error',
        message: 'Failed to block card. Please try again.'
      });
    }
  };

  const handleUnblockCard = async (cardId: string) => {
    try {
      const updatedCard = await mockApi.updateCardStatus(cardId, 'active');
      
      // Update cards list
      setCards(cards.map(card => 
        card.id === cardId ? updatedCard : card
      ));
      
      setNotification({
        type: 'success',
        message: 'Card has been unblocked successfully.'
      });
    } catch (error) {
      console.error('Error unblocking card:', error);
      setNotification({
        type: 'error',
        message: 'Failed to unblock card. Please try again.'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Your Cards
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your debit and credit cards
        </p>
      </div>
      
      {notification && (
        <Alert
          type={notification.type}
          title={notification.type === 'success' ? 'Success' : 'Error'}
          onClose={() => setNotification(null)}
          className="mb-6"
        >
          {notification.message}
        </Alert>
      )}
      
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
      
      {cards.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No cards</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by requesting a new card.</p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Request New Card
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map(card => (
            <div key={card.id}>
              <BankCard
                card={card}
                onBlock={handleBlockCard}
                onUnblock={handleUnblockCard}
              />
              <div className="mt-6 px-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Card Options
                </h3>
                <div className="space-y-2">
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View Transaction History
                  </button>
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Change PIN
                  </button>
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Manage Security Settings
                  </button>
                  <button
                    className="text-sm text-red-600 hover:text-red-800 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Report Lost or Stolen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-10">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Request a New Card
          </h3>
          <p className="text-gray-600 mb-6">
            Choose the type of card you want to request:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-start"
            >
              <div className="mr-4 p-2 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="text-gray-900 font-medium">Debit Card</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Link directly to your checking account for purchases and ATM withdrawals
                </p>
              </div>
            </button>
            
            <button
              className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-start"
            >
              <div className="mr-4 p-2 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="text-gray-900 font-medium">Credit Card</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Apply for a credit line with rewards, cash back, and purchase protection
                </p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Cards;