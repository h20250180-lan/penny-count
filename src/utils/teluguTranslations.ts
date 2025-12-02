export const teluguTranslations = {
  openingBalance: 'ప్రారంభ నిల్వ',
  closingBalance: 'ముగింపు నిల్వ',
  collections: 'వసూళ్లు',
  disbursements: 'పంపిణీలు',
  expenses: 'ఖర్చులు',
  cash: 'నగదు',
  digital: 'డిజిటల్',
  total: 'మొత్తం',
  date: 'తేదీ',
  amount: 'మొత్తం',
  balance: 'నిల్వ',
  income: 'ఆదాయం',
  expenditure: 'ఖర్చు',
  netBalance: 'నికర నిల్వ',
  todaysTransactions: 'నేటి లావాదేవీలు',
  balanceSheet: 'బ్యాలెన్స్ షీట్',
  expenseBreakdown: 'ఖర్చుల వివరాలు',
  paymentMethod: 'చెల్లింపు పద్ధతి',
  category: 'వర్గం',
  description: 'వివరణ',
  totalExpenses: 'మొత్తం ఖర్చులు',
  totalCollections: 'మొత్తం వసూళ్లు',
  totalDisbursements: 'మొత్తం పంపిణీలు',
  netProfit: 'నికర లాభం',
  netLoss: 'నికర నష్టం'
};

const teluguDigits: { [key: string]: string } = {
  '0': '౦',
  '1': '౧',
  '2': '౨',
  '3': '౩',
  '4': '౪',
  '5': '౫',
  '6': '౬',
  '7': '౭',
  '8': '౮',
  '9': '౯'
};

export function convertToTeluguNumber(num: number | string): string {
  const numStr = num.toString();
  return numStr.split('').map(char => teluguDigits[char] || char).join('');
}

export function formatTeluguCurrency(amount: number): string {
  const formatted = amount.toLocaleString('en-IN');
  return '₹' + convertToTeluguNumber(formatted);
}

export function formatTeluguDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString();

  return `${convertToTeluguNumber(day)}/${convertToTeluguNumber(month)}/${convertToTeluguNumber(year)}`;
}

export function getTranslation(key: keyof typeof teluguTranslations, isTeluguMode: boolean): string {
  return isTeluguMode ? teluguTranslations[key] : key.replace(/([A-Z])/g, ' $1').trim();
}
