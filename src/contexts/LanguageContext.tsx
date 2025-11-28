import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'te';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    loans: 'Loans',
    borrowers: 'Borrowers',
    lines: 'Lines',
    collections: 'Collections',
    commissions: 'Commissions',
    analytics: 'Analytics',
    notifications: 'Notifications',
    settings: 'Settings',
    users: 'Users',
    logout: 'Logout',
    welcome: 'Welcome',
    totalLoans: 'Total Loans',
    activeLoans: 'Active Loans',
    totalDisbursed: 'Total Disbursed',
    totalCollected: 'Total Collected',
    pendingCollections: 'Pending Collections',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    newLoan: 'New Loan',
    recordPayment: 'Record Payment',
    addBorrower: 'Add Borrower',
    viewReports: 'View Reports',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    status: 'Status',
    amount: 'Amount',
    balance: 'Balance',
    dueDate: 'Due Date',
    actions: 'Actions',
    active: 'Active',
    completed: 'Completed',
    overdue: 'Overdue',
    pending: 'Pending',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    confirm: 'Confirm',
    success: 'Success',
    error: 'Error',
    loading: 'Loading',
    noData: 'No data available',
    principal: 'Principal',
    interest: 'Interest',
    tenure: 'Tenure',
    interestRate: 'Interest Rate',
    disbursedDate: 'Disbursed Date',
    paymentDate: 'Payment Date',
    collectedBy: 'Collected By',
    notes: 'Notes',
    borrowerName: 'Borrower Name',
    loanAmount: 'Loan Amount',
    lineName: 'Line Name',
    totalAmount: 'Total Amount',
    currentBalance: 'Current Balance',
    availableCredit: 'Available Credit',
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్',
    loans: 'రుణాలు',
    borrowers: 'రుణగ్రహీతలు',
    lines: 'లైన్లు',
    collections: 'వసూళ్లు',
    commissions: 'కమీషన్లు',
    analytics: 'విశ్లేషణ',
    notifications: 'నోటిఫికేషన్లు',
    settings: 'సెట్టింగ్‌లు',
    users: 'వినియోగదారులు',
    logout: 'లాగ్అవుట్',
    welcome: 'స్వాగతం',
    totalLoans: 'మొత్తం రుణాలు',
    activeLoans: 'క్రియాశీల రుణాలు',
    totalDisbursed: 'మొత్తం పంపిణీ చేయబడింది',
    totalCollected: 'మొత్తం వసూలు చేయబడింది',
    pendingCollections: 'పెండింగ్ వసూళ్లు',
    quickActions: 'త్వరిత చర్యలు',
    recentActivity: 'ఇటీవలి కార్యకలాపం',
    newLoan: 'కొత్త రుణం',
    recordPayment: 'చెల్లింపును రికార్డ్ చేయండి',
    addBorrower: 'రుణగ్రహీతను జోడించండి',
    viewReports: 'నివేదికలను వీక్షించండి',
    search: 'వెతకండి',
    filter: 'ఫిల్టర్',
    export: 'ఎగుమతి',
    status: 'స్థితి',
    amount: 'మొత్తం',
    balance: 'బ్యాలెన్స్',
    dueDate: 'గడువు తేదీ',
    actions: 'చర్యలు',
    active: 'క్రియాశీలం',
    completed: 'పూర్తయింది',
    overdue: 'గడువు దాటింది',
    pending: 'పెండింగ్',
    name: 'పేరు',
    phone: 'ఫోన్',
    email: 'ఇమెయిల్',
    address: 'చిరునామా',
    save: 'సేవ్ చేయండి',
    cancel: 'రద్దు చేయండి',
    delete: 'తొలగించండి',
    edit: 'సవరించండి',
    view: 'వీక్షించండి',
    close: 'మూసివేయండి',
    confirm: 'నిర్ధారించండి',
    success: 'విజయవంతం',
    error: 'లోపం',
    loading: 'లోడ్ అవుతోంది',
    noData: 'డేటా అందుబాటులో లేదు',
    principal: 'అసలు',
    interest: 'వడ్డీ',
    tenure: 'కాలవ్యవధి',
    interestRate: 'వడ్డీ రేటు',
    disbursedDate: 'పంపిణీ తేదీ',
    paymentDate: 'చెల్లింపు తేదీ',
    collectedBy: 'వసూలు చేసినవారు',
    notes: 'గమనికలు',
    borrowerName: 'రుణగ్రహీత పేరు',
    loanAmount: 'రుణ మొత్తం',
    lineName: 'లైన్ పేరు',
    totalAmount: 'మొత్తం మొత్తం',
    currentBalance: 'ప్రస్తుత బ్యాలెన్స్',
    availableCredit: 'అందుబాటులో ఉన్న క్రెడిట్',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'te'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
