import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OfflineProvider } from './components/offline/OfflineManager';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './components/dashboard/Dashboard';
import { LinesManagement } from './components/lines/LinesManagement';
import { UsersManagement } from './components/users/UsersManagement';
import { BorrowersManagement } from './components/borrowers/BorrowersManagement';
import { LoansManagement } from './components/loans/LoansManagement';
import { Collections } from './components/collections/Collections';
import { Commissions } from './components/commissions/Commissions';
import { Analytics } from './components/analytics/Analytics';
import { Settings } from './components/settings/Settings';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Penny Count...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'lines':
        return user.role === 'owner' ? 'Lines Management' : 'My Lines';
      case 'users':
        return 'Users & Agents';
      case 'agents':
        return 'My Agents';
      case 'borrowers':
        return user.role === 'agent' ? 'My Borrowers' : 'All Borrowers';
      case 'loans':
        return user.role === 'agent' ? 'Active Loans' : 'Loan Overview';
      case 'collections':
        return 'Collections';
      case 'payments':
        return 'Payments';
      case 'commissions':
        return 'Commissions';
      case 'analytics':
        return user.role === 'co-owner' ? 'Reports' : 'Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onViewAll={(section: string) => setActiveSection(section)} />;
      case 'lines':
        return <LinesManagement />;
      case 'users':
        return <UsersManagement />;
      case 'agents':
        return <UsersManagement />;
      case 'borrowers':
        return <BorrowersManagement />;
      case 'loans':
        return <LoansManagement />;
      case 'collections':
        return <Collections />;
      case 'payments':
        return <Collections />;
      case 'commissions':
        return <Commissions />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={getSectionTitle()} />
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderMainContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </OfflineProvider>
    </ThemeProvider>
  );
}

export default App;