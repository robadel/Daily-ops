import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Don't show navigation on welcome, login, or register pages
  const hideNavigation = ['/', '/login', '/register/manager', '/register/labor'].includes(location.pathname);
  
  if (hideNavigation || !user) {
    return null;
  }

  const handleBack = () => {
    if (location.pathname.includes('/task/')) {
      // From task details, go back to dashboard
      const dashboardPath = user.userType === 'manager' ? '/dashboard/manager' : '/dashboard/labor';
      navigate(dashboardPath);
    } else if (location.pathname === '/create-task') {
      // From create task, go back to manager dashboard
      navigate('/dashboard/manager');
    } else {
      // Default back behavior
      navigate(-1);
    }
  };

  const handleHome = () => {
    const dashboardPath = user.userType === 'manager' ? '/dashboard/manager' : '/dashboard/labor';
    navigate(dashboardPath);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    
    if (path.includes('/dashboard/manager')) {
      return 'Dashboard Manager';
    } else if (path.includes('/dashboard/labor')) {
      return 'Dashboard Labor';
    } else if (path.includes('/create-task')) {
      return 'Dashboard Manager > Nova Tarefa';
    } else if (path.includes('/task/')) {
      return `Dashboard ${user.userType === 'manager' ? 'Manager' : 'Labor'} > Detalhes da Tarefa`;
    }
    
    return 'DailyOps';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Back button and breadcrumbs */}
          <div className="flex items-center space-x-4">
            {location.pathname !== '/dashboard/manager' && location.pathname !== '/dashboard/labor' && (
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
            )}
            
            <div className="text-sm text-gray-500">
              {getBreadcrumbs()}
            </div>
          </div>

          {/* Center - Logo */}
          <div className="flex items-center">
            <button
              onClick={handleHome}
              className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span>DailyOps</span>
            </button>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user.displayName || user.email}</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {user.userType === 'manager' ? 'Manager' : 'Labor'}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

