import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CreditCard,
  Wallet,
  PiggyBank,
  MessageSquare,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavbarProps {
  onOpenSidebar: () => void;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Only show important navigation items in the bottom bar
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Accounts', path: '/accounts', icon: <Wallet size={20} /> },
    { name: 'Cards', path: '/cards', icon: <CreditCard size={20} /> },
    { name: 'Loans', path: '/loans', icon: <PiggyBank size={20} /> },
    { name: 'Support', path: '/support', icon: <MessageSquare size={20} /> }
  ];

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="grid grid-cols-6">
        {navItems.map((item, index) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              flex flex-col items-center py-2
              ${isActive(item.path) 
                ? 'text-blue-600' 
                : 'text-gray-500 hover:text-blue-600'}
            `}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
        
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center py-2 text-gray-500 hover:text-blue-600"
        >
          <Menu size={20} />
          <span className="text-xs mt-1">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavbar;