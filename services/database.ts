
import { Transaction, AppState, TransactionType, Book, Insight } from '../types';

const STORAGE_KEY = 'even_money_data_v3';

export const DEFAULT_STATE: AppState = {
  isLoggedIn: false,
  books: [],
  currentBookId: null,
  transactions: [],
  insights: [],
  currency: 'INR',
  userName: 'Guest',
  theme: 'dark'
};

export const database = {
  getState: (): AppState => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_STATE;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        books: parsed.books || [],
        transactions: parsed.transactions || [],
        insights: parsed.insights || []
      };
    } catch (e) {
      console.error("Failed to read from localStorage", e);
      return DEFAULT_STATE;
    }
  },

  saveState: (state: AppState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  },

  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear localStorage", e);
    }
  },

  login: (name: string) => {
    const state = database.getState();
    state.isLoggedIn = true;
    state.userName = name;
    database.saveState(state);
  },

  logout: () => {
    const state = database.getState();
    state.isLoggedIn = false;
    state.currentBookId = null;
    database.saveState(state);
  },

  createBook: (name: string, emoji: string, color: string) => {
    const state = database.getState();
    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      emoji,
      color,
      createdAt: new Date().toISOString()
    };
    state.books.push(newBook);
    state.currentBookId = newBook.id;
    database.saveState(state);
    return newBook;
  },

  deleteBook: (bookId: string) => {
    const state = database.getState();
    const filteredBooks = state.books.filter(b => b.id !== bookId);
    const filteredTransactions = state.transactions.filter(t => t.bookId !== bookId);
    const filteredInsights = state.insights.filter(i => i.bookId !== bookId);
    const newCurrentBookId = state.currentBookId === bookId ? null : state.currentBookId;
    
    const newState = {
      ...state,
      books: filteredBooks,
      transactions: filteredTransactions,
      insights: filteredInsights,
      currentBookId: newCurrentBookId
    };

    database.saveState(newState);
    return newState;
  },

  setCurrentBook: (bookId: string | null) => {
    const state = database.getState();
    state.currentBookId = bookId;
    database.saveState(state);
  },

  addTransaction: (transaction: Omit<Transaction, 'bookId'>) => {
    const state = database.getState();
    if (!state.currentBookId) return;
    const fullTransaction: Transaction = { ...transaction, bookId: state.currentBookId };
    state.transactions = [fullTransaction, ...state.transactions];
    database.saveState(state);
  },

  deleteTransaction: (id: string) => {
    const state = database.getState();
    const initialCount = state.transactions.length;
    const filtered = state.transactions.filter(t => t.id !== id);
    if (filtered.length !== initialCount) {
      database.saveState({ ...state, transactions: filtered });
      return true;
    }
    return false;
  },

  updateTransaction: (transaction: Transaction) => {
    const state = database.getState();
    const index = state.transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      state.transactions[index] = transaction;
      database.saveState(state);
    }
  },

  getActiveTransactions: (): Transaction[] => {
    const state = database.getState();
    if (!state.currentBookId) return [];
    return state.transactions.filter(t => t.bookId === state.currentBookId);
  },

  getActiveInsights: (): Insight[] => {
    const state = database.getState();
    if (!state.currentBookId) return [];
    return state.insights.filter(i => i.bookId === state.currentBookId);
  },

  getBookStats: (bookId: string) => {
    const state = database.getState();
    const bookTransactions = state.transactions.filter(t => t.bookId === bookId);
    const income = bookTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = bookTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return { balance: income - expense, count: bookTransactions.length };
  },

  getGlobalStats: () => {
    const state = database.getState();
    const income = state.transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = state.transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return { totalBalance: income - expense, bookCount: state.books.length, transactionCount: state.transactions.length };
  }
};
