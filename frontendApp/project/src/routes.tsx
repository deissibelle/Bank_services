import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import TransactionForm from './pages/TransactionForm';
import Cards from './pages/Cards';
import Support from './pages/Support';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import MobileNavbar from './components/layout/MobileNavbar';
import Header from './components/layout/Header';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Layout Component
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar for desktop */}
        <div className="hidden lg:block">
          <Sidebar isMobile={false} />
        </div>
        
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <Sidebar isMobile={true} onClose={closeSidebar} />
        )}
        
        {/* Main content */}
        <div className="flex-1">
          <Header onOpenSidebar={openSidebar} />
          <main className="pb-16 lg:pb-0">
            {children}
          </main>
          
          {/* Mobile navigation */}
          <div className="lg:hidden">
            <MobileNavbar onOpenSidebar={openSidebar} />
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/accounts" element={
            <ProtectedRoute>
              <AppLayout>
                <Accounts />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/transactions/new" element={
            <ProtectedRoute>
              <AppLayout>
                <TransactionForm />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/cards" element={
            <ProtectedRoute>
              <AppLayout>
                <Cards />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/support" element={
            <ProtectedRoute>
              <AppLayout>
                <Support />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;