import React from 'react';
import { Card as CardType } from '../../types';

interface BankCardProps {
  card: CardType;
  onBlock?: (cardId: string) => void;
  onUnblock?: (cardId: string) => void;
}

const BankCard: React.FC<BankCardProps> = ({ 
  card,
  onBlock,
  onUnblock
}) => {
  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.split('-').join(' ');
  };

  const bgColor = card.type === 'credit' 
    ? 'from-blue-900 to-blue-700' 
    : 'from-emerald-700 to-emerald-500';

  const handleToggleStatus = () => {
    if (card.status === 'active' && onBlock) {
      onBlock(card.id);
    } else if (card.status === 'blocked' && onUnblock) {
      onUnblock(card.id);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className={`
        relative h-48 w-full rounded-xl overflow-hidden 
        bg-gradient-to-r ${bgColor} shadow-lg
        transform transition-transform duration-300 hover:scale-[1.02]
      `}>
        {/* Card chip */}
        <div className="absolute top-6 left-6 h-10 w-12 rounded-md bg-yellow-400 bg-opacity-80 flex flex-col justify-between p-1">
          <div className="flex space-x-1">
            <div className="h-1 w-3 bg-yellow-600"></div>
            <div className="h-1 w-3 bg-yellow-600"></div>
          </div>
          <div className="flex space-x-1">
            <div className="h-1 w-3 bg-yellow-600"></div>
            <div className="h-1 w-3 bg-yellow-600"></div>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="absolute top-4 right-4">
          {card.status === 'active' ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          ) : card.status === 'blocked' ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Blocked
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Expired
            </span>
          )}
        </div>
        
        {/* Card number */}
        <div className="absolute top-20 left-6 right-6">
          <p className="text-white text-xl font-mono tracking-wider">
            {formatCardNumber(card.cardNumber)}
          </p>
        </div>
        
        {/* Card details */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between">
          <div>
            <p className="text-white text-xs opacity-80">CARD HOLDER</p>
            <p className="text-white font-medium">{card.cardholderName}</p>
          </div>
          <div>
            <p className="text-white text-xs opacity-80">EXPIRES</p>
            <p className="text-white font-medium">{card.expiryDate}</p>
          </div>
        </div>
        
        {/* Card type */}
        <div className="absolute top-6 right-6 text-white font-bold uppercase">
          {card.type}
        </div>
        
        {/* Overlay if blocked */}
        {card.status === 'blocked' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="rounded-full border-2 border-red-500 p-2">
              <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Card actions */}
      <div className="mt-4">
        <button
          onClick={handleToggleStatus}
          disabled={card.status === 'expired'}
          className={`
            w-full py-2 px-4 rounded-md transition-colors
            ${card.status === 'active'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : card.status === 'blocked'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
          `}
        >
          {card.status === 'active' ? 'Block Card' : card.status === 'blocked' ? 'Unblock Card' : 'Expired'}
        </button>
      </div>
    </div>
  );
};

export default BankCard;