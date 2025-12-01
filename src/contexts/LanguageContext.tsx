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

    // Forms and Actions
    addNewLine: 'Add New Line',
    editLine: 'Edit Line',
    addNewBorrower: 'Add New Borrower',
    editBorrower: 'Edit Borrower',
    addNewLoan: 'Add New Loan',
    editLoan: 'Edit Loan',
    addPayment: 'Add Payment',
    viewDetails: 'View Details',
    description: 'Description',
    creditLimit: 'Credit Limit',
    utilizationRate: 'Utilization Rate',
    selectLine: 'Select Line',
    selectBorrower: 'Select Borrower',
    selectAgent: 'Select Agent',
    aadharNumber: 'Aadhar Number',
    panNumber: 'PAN Number',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    bank: 'Bank Transfer',
    upi: 'UPI',
    cheque: 'Cheque',
    transactionId: 'Transaction ID',
    remarks: 'Remarks',
    submit: 'Submit',
    reset: 'Reset',
    clear: 'Clear',
    apply: 'Apply',
    approve: 'Approve',
    reject: 'Reject',
    activate: 'Activate',
    deactivate: 'Deactivate',
    enable: 'Enable',
    disable: 'Disable',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    required: 'Required',
    optional: 'Optional',
    enterValue: 'Enter value',
    selectOption: 'Select option',
    chooseFile: 'Choose file',
    uploadFile: 'Upload file',
    download: 'Download',
    print: 'Print',
    refresh: 'Refresh',
    viewAll: 'View All',
    showMore: 'Show More',
    showLess: 'Show Less',
    totalRecords: 'Total Records',
    noRecordsFound: 'No records found',
    searchPlaceholder: 'Search...',
    filterBy: 'Filter by',
    sortBy: 'Sort by',
    ascending: 'Ascending',
    descending: 'Descending',
    perPage: 'Per page',
    page: 'Page',
    of: 'of',
    showing: 'Showing',
    to: 'to',
    entries: 'entries',
    all: 'All',
    today: 'Today',
    yesterday: 'Yesterday',
    lastWeek: 'Last Week',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    customRange: 'Custom Range',
    startDate: 'Start Date',
    endDate: 'End Date',
    fromDate: 'From Date',
    toDate: 'To Date',
    role: 'Role',
    owner: 'Owner',
    coOwner: 'Co-owner',
    agent: 'Agent',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    username: 'Username',
    fullName: 'Full Name',
    firstName: 'First Name',
    lastName: 'Last Name',
    mobileNumber: 'Mobile Number',
    alternateNumber: 'Alternate Number',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    country: 'Country',

    // Expenses
    expenses: 'Expenses',
    expenseManagement: 'Expense Management',
    recordExpense: 'Record Expense',
    totalExpenses: 'Total Expenses',
    approvedExpenses: 'Approved',
    paidExpenses: 'Paid',
    category: 'Category',
    expenseDate: 'Expense Date',
    receiptUrl: 'Receipt URL',
    viewReceipt: 'View Receipt',
    markAsPaid: 'Mark as Paid',
    categoryBreakdown: 'Category Breakdown',
    digital: 'Digital',
    bankTransfer: 'Bank Transfer',
    rejected: 'Rejected',

    // Time Periods
    last3Months: 'Last 3 Months',
    last6Months: 'Last 6 Months',
    allPeriods: 'All Periods',

    // Metrics
    disbursed: 'Disbursed',
    collected: 'Collected',
    loanCount: 'Loan Count',
    exportReport: 'Export Report',

    // Payment Methods
    allMethods: 'All Methods',
    phonepe: 'PhonePe',
    qrCode: 'QR Code',

    // Actions & Buttons
    addUser: 'Add User',
    switchToAgentMode: 'Switch to Agent Mode',
    agentModeActive: 'Agent Mode Active',
    trackingOn: 'Tracking ON',
    trackingOff: 'Tracking OFF',

    // Roles & Status
    allRoles: 'All Roles',
    owners: 'Owners',
    coOwners: 'Co-Owners',
    agents: 'Agents',
    allStatus: 'All Status',

    // Selection Prompts
    chooseBorrower: 'Choose borrower',
    selectActiveLoan: 'Select active loan',
    chooseALine: 'Choose a line...',
    selectRole: 'Select Role',

    // Features
    realtimeLocationTracking: 'Real-time location tracking',
    collectionInterfaceAccess: 'Collection interface access',
    commissionEligibility: 'Commission eligibility',
    performanceTracking: 'Performance tracking',

    // Messages
    noLoansMessage: 'Get started by creating your first loan',
    tryAdjustingFilters: 'Try adjusting your search or filters',
    remaining: 'remaining',

    // Monitoring & Locations
    dailyMonitoring: 'Daily Monitoring',
    agentLocations: 'Agent Locations',

    // App Name
    appName: 'Penny Count',
    financialManagement: 'Financial Management',
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

    // Forms and Actions
    addNewLine: 'కొత్త లైన్ జోడించు',
    editLine: 'లైన్ సవరించు',
    addNewBorrower: 'కొత్త రుణగ్రహీత జోడించు',
    editBorrower: 'రుణగ్రహీత సవరించు',
    addNewLoan: 'కొత్త రుణం జోడించు',
    editLoan: 'రుణం సవరించు',
    addPayment: 'చెల్లింపు జోడించు',
    viewDetails: 'వివరాలు చూడండి',
    description: 'వివరణ',
    creditLimit: 'క్రెడిట్ పరిమితి',
    utilizationRate: 'వినియోగ రేటు',
    selectLine: 'లైన్ ఎంచుకోండి',
    selectBorrower: 'రుణగ్రహీతను ఎంచుకోండి',
    selectAgent: 'ఏజెంట్ ఎంచుకోండి',
    aadharNumber: 'ఆధార్ నంబర్',
    panNumber: 'పాన్ నంబర్',
    paymentMethod: 'చెల్లింపు పద్ధతి',
    cash: 'నగదు',
    bank: 'బ్యాంక్ బదిలీ',
    upi: 'యుపిఐ',
    cheque: 'చెక్',
    transactionId: 'లావాదేవీ ID',
    remarks: 'వ్యాఖ్యలు',
    submit: 'సమర్పించు',
    reset: 'రీసెట్',
    clear: 'క్లియర్',
    apply: 'వర్తించు',
    approve: 'ఆమోదించు',
    reject: 'తిరస్కరించు',
    activate: 'సక్రియం చేయి',
    deactivate: 'నిష్క్రియం చేయి',
    enable: 'ప్రారంభించు',
    disable: 'నిలిపివేయి',
    yes: 'అవును',
    no: 'కాదు',
    ok: 'సరే',
    back: 'వెనుకకు',
    next: 'తదుపరి',
    previous: 'మునుపటి',
    finish: 'ముగించు',
    required: 'అవసరం',
    optional: 'ఐచ్ఛికం',
    enterValue: 'విలువ నమోదు చేయండి',
    selectOption: 'ఎంపిక ఎంచుకోండి',
    chooseFile: 'ఫైల్ ఎంచుకోండి',
    uploadFile: 'ఫైల్ అప్‌లోడ్ చేయండి',
    download: 'డౌన్‌లోడ్',
    print: 'ముద్రించు',
    refresh: 'రిఫ్రెష్',
    viewAll: 'అన్నీ చూడండి',
    showMore: 'మరిన్ని చూపించు',
    showLess: 'తక్కువ చూపించు',
    totalRecords: 'మొత్తం రికార్డులు',
    noRecordsFound: 'రికార్డులు కనుగొనబడలేదు',
    searchPlaceholder: 'వెతకండి...',
    filterBy: 'ఫిల్టర్',
    sortBy: 'క్రమం',
    ascending: 'ఆరోహణ',
    descending: 'అవరోహణ',
    perPage: 'పేజీకి',
    page: 'పేజీ',
    of: 'లో',
    showing: 'చూపిస్తోంది',
    to: 'నుండి',
    entries: 'ఎంట్రీలు',
    all: 'అన్ని',
    today: 'ఈరోజు',
    yesterday: 'నిన్న',
    lastWeek: 'గత వారం',
    lastMonth: 'గత నెల',
    thisYear: 'ఈ సంవత్సరం',
    customRange: 'కస్టమ్ పరిధి',
    startDate: 'ప్రారంభ తేదీ',
    endDate: 'ముగింపు తేదీ',
    fromDate: 'తేదీ నుండి',
    toDate: 'తేదీ వరకు',
    role: 'పాత్ర',
    owner: 'యజమాని',
    coOwner: 'సహ-యజమాని',
    agent: 'ఏజెంట్',
    password: 'పాస్‌వర్డ్',
    confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించు',
    username: 'యూజర్‌నేమ్',
    fullName: 'పూర్తి పేరు',
    firstName: 'మొదటి పేరు',
    lastName: 'చివరి పేరు',
    mobileNumber: 'మొబైల్ నంబర్',
    alternateNumber: 'ప్రత్యామ్నాయ నంబర్',
    dateOfBirth: 'పుట్టిన తేదీ',
    gender: 'లింగం',
    male: 'పురుషుడు',
    female: 'స్త్రీ',
    other: 'ఇతర',
    city: 'నగరం',
    state: 'రాష్ట్రం',
    pincode: 'పిన్‌కోడ్',
    country: 'దేశం',

    // Expenses
    expenses: 'ఖర్చులు',
    expenseManagement: 'ఖర్చుల నిర్వహణ',
    recordExpense: 'ఖర్చు రికార్డ్',
    totalExpenses: 'మొత్తం ఖర్చులు',
    approvedExpenses: 'ఆమోదించబడింది',
    paidExpenses: 'చెల్లించబడింది',
    category: 'వర్గం',
    expenseDate: 'ఖర్చు తేదీ',
    receiptUrl: 'రసీదు URL',
    viewReceipt: 'రసీదు చూడండి',
    markAsPaid: 'చెల్లించినట్లు గుర్తించు',
    categoryBreakdown: 'వర్గ విభజన',
    digital: 'డిజిటల్',
    bankTransfer: 'బ్యాంక్ బదిలీ',
    rejected: 'తిరస్కరించబడింది',

    // Time Periods
    last3Months: 'గత 3 నెలలు',
    last6Months: 'గత 6 నెలలు',
    allPeriods: 'అన్ని కాలాలు',

    // Metrics
    disbursed: 'పంపిణీ చేయబడింది',
    collected: 'వసూలు చేయబడింది',
    loanCount: 'రుణాల సంఖ్య',
    exportReport: 'నివేదిక ఎగుమతి',

    // Payment Methods
    allMethods: 'అన్ని పద్ధతులు',
    phonepe: 'ఫోన్‌పే',
    qrCode: 'క్యూఆర్ కోడ్',

    // Actions & Buttons
    addUser: 'వినియోగదారుని జోడించు',
    switchToAgentMode: 'ఏజెంట్ మోడ్‌కు మారు',
    agentModeActive: 'ఏజెంట్ మోడ్ యాక్టివ్',
    trackingOn: 'ట్రాకింగ్ ఆన్',
    trackingOff: 'ట్రాకింగ్ ఆఫ్',

    // Roles & Status
    allRoles: 'అన్ని పాత్రలు',
    owners: 'యజమానులు',
    coOwners: 'సహ-యజమానులు',
    agents: 'ఏజెంట్లు',
    allStatus: 'అన్ని స్థితులు',

    // Selection Prompts
    chooseBorrower: 'రుణగ్రహీతను ఎంచుకోండి',
    selectActiveLoan: 'క్రియాశీల రుణాన్ని ఎంచుకోండి',
    chooseALine: 'లైన్ ఎంచుకోండి...',
    selectRole: 'పాత్ర ఎంచుకోండి',

    // Features
    realtimeLocationTracking: 'రియల్-టైమ్ స్థాన ట్రాకింగ్',
    collectionInterfaceAccess: 'వసూలు ఇంటర్‌ఫేస్ యాక్సెస్',
    commissionEligibility: 'కమీషన్ అర్హత',
    performanceTracking: 'పనితీరు ట్రాకింగ్',

    // Messages
    noLoansMessage: 'మీ మొదటి రుణాన్ని సృష్టించడం ద్వారా ప్రారంభించండి',
    tryAdjustingFilters: 'మీ శోధన లేదా ఫిల్టర్‌లను సర్దుబాటు చేయండి',
    remaining: 'మిగిలినది',

    // Monitoring & Locations
    dailyMonitoring: 'రోజువారీ పర్యవేక్షణ',
    agentLocations: 'ఏజెంట్ స్థానాలు',

    // App Name
    appName: 'పెన్నీ కౌంట్',
    financialManagement: 'ఆర్థిక నిర్వహణ',
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
