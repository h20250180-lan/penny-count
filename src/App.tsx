import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useLanguage } from './contexts/LanguageContext';
import { OfflineProvider } from './components/offline/OfflineManager';
import { LineProvider } from './contexts/LineContext';
import { LocationProvider } from './contexts/LocationContext';
import { LineSelector } from './components/line-selector/LineSelector';
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
import { AgentLocationMap } from './components/location/AgentLocationMap';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { ExpensesManagement } from './components/expenses/ExpensesManagement';
import { OwnerDashboard } from './components/owner/OwnerDashboard';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')} Penny Count...</p>
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
        return t('dashboard');
      case 'lines':
        return user.role === 'owner' ? t('linesManagement') : t('myLines');
      case 'users':
        return t('usersAgents');
      case 'agents':
        return t('myAgents');
      case 'borrowers':
        return user.role === 'agent' ? t('myBorrowers') : t('allBorrowers');
      case 'loans':
        return user.role === 'agent' ? t('activeLoans') : t('loanOverview');
      case 'collections':
        return t('collections');
      case 'payments':
        return t('payments');
      case 'commissions':
        return t('commissions');
      case 'analytics':
        return user.role === 'co-owner' ? t('reports') : t('analytics');
      case 'locations':
        return 'Agent Locations';
      case 'expenses':
        return 'Expenses Management';
      case 'owner-monitoring':
        return 'Daily Monitoring';
      case 'settings':
        return t('settings');
      default:
        return t('dashboard');
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
      case 'locations':
        return <AgentLocationMap />;
      case 'expenses':
        return <ExpensesManagement />;
      case 'owner-monitoring':
        return <OwnerDashboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 flex">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={getSectionTitle()} />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {renderMainContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <AuthProvider>
          <LineProvider>
            <LocationProvider>
              <LineSelector />
              <AppContent />
            </LocationProvider>
          </LineProvider>
        </AuthProvider>
      </OfflineProvider>
    </ThemeProvider>
  );
}

export default App;