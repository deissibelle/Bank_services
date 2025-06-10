import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  Wallet, 
  PiggyBank,
  MessageSquare,
  BarChart3,
  LogOut,
  Users,
  BanknoteIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isMobile: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} />, roles: ['client', 'employee', 'admin'] },
    { name: 'Accounts', path: '/accounts', icon: <Wallet size={20} />, roles: ['client', 'employee', 'admin'] },
    { name: 'Cards', path: '/cards', icon: <CreditCard size={20} />, roles: ['client', 'employee', 'admin'] },
    { name: 'Transactions', path: '/transactions', icon: <BanknoteIcon size={20} />, roles: ['client', 'employee', 'admin'] },
    { name: 'Loans', path: '/loans', icon: <PiggyBank size={20} />, roles: ['client', 'employee', 'admin'] },
    { name: 'Support', path: '/support', icon: <MessageSquare size={20} />, roles: ['client', 'employee', 'admin'] },
    { name: 'Clients', path: '/clients', icon: <Users size={20} />, roles: ['employee', 'admin'] },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} />, roles: ['admin'] }
  ];

  const filteredNavItems = user 
    ? navItems.filter(item => item.roles.includes(user.role))
    : [];

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  return (
    <div className={`
      bg-blue-900 text-white 
      ${isMobile 
        ? 'fixed inset-0 z-50 p-5 overflow-y-auto' 
        : 'w-64 min-h-screen'}
    `}>
      {isMobile && (
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      <div className="flex items-center justify-center p-6 border-b border-blue-800">
        <div className="flex items-center space-x-2">
          <CreditCard size={28} className="text-emerald-400" />
          <h1 className="text-xl font-bold">SecureBank</h1>
        </div>
      </div>
      
      {user && (
        <div className="p-4 border-b border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-blue-300 truncate capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
                ${isActive(item.path)
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'}
              `}
              onClick={isMobile ? onClose : undefined}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full group flex items-center px-4 py-3 mt-2 text-sm font-medium rounded-md text-blue-100 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;