import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';
import Navigation from './components/layout/Navigation';
import PWABanner from './components/common/PWABanner';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ManagerRegisterPage from './pages/ManagerRegisterPage';
import LaborRegisterPage from './pages/LaborRegisterPage';
import ManagerDashboard from './pages/ManagerDashboard';
import LaborDashboard from './pages/LaborDashboard';
import CreateTaskPage from './pages/CreateTaskPage';
import TaskDetailsPage from './pages/TaskDetailsPage';

import './App.css';

// Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/manager" element={<ManagerRegisterPage />} />
      <Route path="/register/labor" element={<LaborRegisterPage />} />
      <Route path="/dashboard/manager" element={<ManagerDashboard />} />
      <Route path="/dashboard/labor" element={<LaborDashboard />} />
      <Route path="/create-task" element={<CreateTaskPage />} />
      <Route path="/task/:taskId" element={<TaskDetailsPage />} />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <TasksProvider>
        <Router>
          <div className="App">
            <Navigation />
            <PWABanner />
            <AppRoutes />
          </div>
        </Router>
      </TasksProvider>
    </AuthProvider>
  );
}

export default App;

