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
    // Navigation
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
    linesManagement: 'Lines Management',
    myLines: 'My Lines',
    usersAgents: 'Users & Agents',
    myAgents: 'My Agents',
    allBorrowers: 'All Borrowers',
    myBorrowers: 'My Borrowers',
    loanOverview: 'Loan Overview',
    activeLoans: 'Active Loans',
    payments: 'Payments',
    reports: 'Reports',

    // General
    welcome: 'Welcome',
    search: 'Search',
    searchBorrowersLoans: 'Search borrowers, loans...',
    filter: 'Filter',
    export: 'Export',
    online: 'Online',
    offline: 'Offline',

    // Dashboard
    totalLoans: 'Total Loans',
    totalLines: 'Total Lines',
    totalDisbursed: 'Total Disbursed',
    totalCollected: 'Total Collected',
    netProfit: 'Net Profit',
    activeBorrowers: 'Active Borrowers',
    overdueLoans: 'Overdue Loans',
    pendingCollections: 'Pending Collections',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    newLoan: 'New Loan',
    recordPayment: 'Record Payment',
    addBorrower: 'Add Borrower',
    viewReports: 'View Reports',
    thisMonth: 'this month',
    fromLastMonth: 'from last month',

    // Status
    status: 'Status',
    active: 'Active',
    completed: 'Completed',
    overdue: 'Overdue',
    pending: 'Pending',
    paid: 'Paid',
    partial: 'Partial',

    // Common fields
    amount: 'Amount',
    balance: 'Balance',
    dueDate: 'Due Date',
    actions: 'Actions',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    date: 'Date',

    // Buttons
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    confirm: 'Confirm',
    add: 'Add',
    update: 'Update',
    create: 'Create',

    // Messages
    success: 'Success',
    error: 'Error',
    loading: 'Loading',
    noData: 'No data available',

    // Loan fields
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
    paidAmount: 'Paid Amount',
    remainingAmount: 'Remaining Amount',

    // Quick Actions
    collectPayment: 'Collect Payment',
    recordCollection: 'Record collection',
    disburseLoan: 'Disburse loan',
    newCustomer: 'New customer',
    syncData: 'Sync Data',
    uploadOfflineData: 'Upload offline data',
    createLine: 'Create Line',
    newLendingLine: 'New lending line',
    addAgent: 'Add Agent',
    assignNewAgent: 'Assign new agent',
    analyticsInsights: 'Analytics & insights',
    exportData: 'Export Data',
    downloadReports: 'Download reports',
  },
  te: {
    // Navigation
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
    linesManagement: 'లైన్ల నిర్వహణ',
    myLines: 'నా లైన్లు',
    usersAgents: 'వినియోగదారులు & ఏజెంట్లు',
    myAgents: 'నా ఏజెంట్లు',
    allBorrowers: 'అన్ని రుణగ్రహీతలు',
    myBorrowers: 'నా రుణగ్రహీతలు',
    loanOverview: 'రుణాల సమీక్ష',
    activeLoans: 'క్రియాశీల రుణాలు',
    payments: 'చెల్లింపులు',
    reports: 'నివేదికలు',

    // General
    welcome: 'స్వాగతం',
    search: 'వెతకండి',
    searchBorrowersLoans: 'రుణగ్రహీతలు, రుణాలు వెతకండి...',
    filter: 'ఫిల్టర్',
    export: 'ఎగుమతి',
    online: 'ఆన్‌లైన్',
    offline: 'ఆఫ్‌లైన్',

    // Dashboard
    totalLoans: 'మొత్తం రుణాలు',
    totalLines: 'మొత్తం లైన్లు',
    totalDisbursed: 'మొత్తం పంపిణీ',
    totalCollected: 'మొత్తం వసూలు',
    netProfit: 'నికర లాభం',
    activeBorrowers: 'క్రియాశీల రుణగ్రహీతలు',
    overdueLoans: 'గడువు దాటిన రుణాలు',
    pendingCollections: 'పెండింగ్ వసూళ్లు',
    quickActions: 'త్వరిత చర్యలు',
    recentActivity: 'ఇటీవలి కార్యకలాపం',
    newLoan: 'కొత్త రుణం',
    recordPayment: 'చెల్లింపు రికార్డ్',
    addBorrower: 'రుణగ్రహీతను జోడించు',
    viewReports: 'నివేదికలు చూడండి',
    thisMonth: 'ఈ నెల',
    fromLastMonth: 'గత నెల నుండి',

    // Status
    status: 'స్థితి',
    active: 'క్రియాశీలం',
    completed: 'పూర్తయింది',
    overdue: 'గడువు దాటింది',
    pending: 'పెండింగ్',
    paid: 'చెల్లించబడింది',
    partial: 'పాక్షికం',

    // Common fields
    amount: 'మొత్తం',
    balance: 'బ్యాలెన్స్',
    dueDate: 'గడువు తేదీ',
    actions: 'చర్యలు',
    name: 'పేరు',
    phone: 'ఫోన్',
    email: 'ఇమెయిల్',
    address: 'చిరునామా',
    date: 'తేదీ',

    // Buttons
    save: 'సేవ్ చేయండి',
    cancel: 'రద్దు చేయండి',
    delete: 'తొలగించండి',
    edit: 'సవరించండి',
    view: 'వీక్షించండి',
    close: 'మూసివేయండి',
    confirm: 'నిర్ధారించండి',
    add: 'జోడించండి',
    update: 'నవీకరించండి',
    create: 'సృష్టించండి',

    // Messages
    success: 'విజయవంతం',
    error: 'లోపం',
    loading: 'లోడ్ అవుతోంది',
    noData: 'డేటా అందుబాటులో లేదు',

    // Loan fields
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
    availableCredit: 'అందుబాటులో క్రెడిట్',
    paidAmount: 'చెల్లించిన మొత్తం',
    remainingAmount: 'మిగిలిన మొత్తం',

    // Quick Actions
    collectPayment: 'చెల్లింపు వసూలు',
    recordCollection: 'వసూలు రికార్డ్',
    disburseLoan: 'రుణం పంపిణీ',
    newCustomer: 'కొత్త కస్టమర్',
    syncData: 'డేటా సింక్',
    uploadOfflineData: 'ఆఫ్‌లైన్ డేటా అప్‌లోడ్',
    createLine: 'లైన్ సృష్టించు',
    newLendingLine: 'కొత్త లెండింగ్ లైన్',
    addAgent: 'ఏజెంట్ జోడించు',
    assignNewAgent: 'కొత్త ఏజెంట్ కేటాయించు',
    analyticsInsights: 'విశ్లేషణ & అంతర్దృష్టులు',
    exportData: 'డేటా ఎగుమతి',
    downloadReports: 'నివేదికలు డౌన్‌లోడ్',
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
