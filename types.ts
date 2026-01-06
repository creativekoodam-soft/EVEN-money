
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Transaction {
  id: string;
  bookId: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
  description?: string;
  isConfirmed: boolean;
}

export interface Book {
  id: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
}

export interface Insight {
  id: string;
  bookId: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  date: string;
}

export interface AppState {
  isLoggedIn: boolean;
  books: Book[];
  currentBookId: string | null;
  transactions: Transaction[];
  insights: Insight[];
  currency: string;
  userName: string;
  theme: 'light' | 'dark';
}

export type View = 'landing' | 'login' | 'book_selector' | 'dashboard' | 'chat' | 'timeline' | 'reports' | 'insights' | 'settings';
