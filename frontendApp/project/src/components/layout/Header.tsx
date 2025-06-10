import React, { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../presentation/components/LanguageSwitcher';

interface HeaderProps {
  onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  // Sample notifications
  const notifications = [
    { id: 1, message: 'Your loan application has been approved', time: '5 minutes ago', read: false },
    { id: 2, message: 'New transaction: -$85.00 at Restaurant', time: '1 hour ago', read: false },
    { id: 3, message: 'Security alert: New login detected', time: '2 days ago', read: true },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center lg:hidden">
          <button
            onClick={onOpenSidebar}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu size={24} />
          </button>
        </div>
        
        <div className="flex-1 lg:flex lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-medium text-gray-900 truncate">
              {t('dashboard.welcome', { name: user?.firstName || 'User' })}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="p-1 rounded-full text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">View notifications</span>
                <Bell size={22} />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 ${notification.read ? '' : 'bg-blue-50'}`}
                      >
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                    
                    {notifications.length === 0 && (
                      <div className="px-4 py-3 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 px-4 py-2">
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center text-white">
                  <span className="text-sm font-medium">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;