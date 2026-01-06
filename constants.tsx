
import React from 'react';

export const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Salary',
  'Investment',
  'Gift',
  'Other'
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'INR', symbol: '₹' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' }
];

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f87171',
  'Transport': '#60a5fa',
  'Shopping': '#fbbf24',
  'Housing': '#34d399',
  'Utilities': '#a78bfa',
  'Entertainment': '#f472b6',
  'Health': '#fb7185',
  'Salary': '#2dd4bf',
  'Investment': '#818cf8',
  'Gift': '#fcd34d',
  'Other': '#94a3b8'
};
