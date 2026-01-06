
import React, { useState } from 'react';
import { database } from '../services/database';
import { TransactionType } from '../types';
import { CATEGORIES } from '../constants';

interface ManualEntryProps {
  onComplete: () => void;
}

const ManualEntry: React.FC<ManualEntryProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: CATEGORIES[0],
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    database.addTransaction({
      id: Date.now().toString(),
      amount: amount,
      category: formData.category,
      date: new Date(formData.date).toISOString(),
      type: formData.type,
      description: formData.description || 'Manual Entry',
      isConfirmed: true
    });

    onComplete();
  };

  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Modern browsers support showPicker() to programmatically open the calendar
    if ('showPicker' in e.currentTarget) {
      try {
        (e.currentTarget as any).showPicker();
      } catch (err) {
        console.error("Error opening date picker", err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onComplete} className="w-10 h-10 rounded-full glass flex items-center justify-center text-zinc-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold tracking-tight">Manual <span className="gradient-text">Entry</span></h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass p-6 rounded-[2.5rem] space-y-6 border-white/5">
          {/* Type Toggle */}
          <div className="flex p-1 glass rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                formData.type === TransactionType.EXPENSE ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-zinc-500'
              }`}
            >
              EXPENSE
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                formData.type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-500'
              }`}
            >
              INCOME
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Amount</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-[1.5rem] p-5 text-2xl font-black outline-none focus:border-indigo-500 transition-all text-center"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Category</label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-[1.5rem] p-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  onClick={handleDateClick}
                  style={{ colorScheme: 'dark' }}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-[1.5rem] p-4 text-xs font-bold outline-none focus:border-indigo-500 transition-all block cursor-pointer"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Description (Optional)</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-[1.5rem] p-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!formData.amount}
          className="w-full py-6 bg-indigo-600 rounded-[2.5rem] text-lg font-black text-white shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          Add Record
        </button>
      </form>
    </div>
  );
};

export default ManualEntry;
