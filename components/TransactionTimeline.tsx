
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { database } from '../services/database';
import { CATEGORY_COLORS, CATEGORIES } from '../constants';

interface TransactionTimelineProps {
  transactions: Transaction[];
  onDelete: () => void;
}

const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ transactions, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const grouped = sortedTransactions.reduce((acc, t) => {
    const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!acc[day]) acc[day] = [];
    acc[day].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const performDelete = (id: string) => {
    const success = database.deleteTransaction(id);
    if (success) {
      setShowConfirmDelete(null);
      onDelete(); // Trigger re-render in App.tsx
    } else {
      alert("Failed to delete transaction. Please try again.");
      setShowConfirmDelete(null);
    }
  };

  const startEdit = (item: Transaction) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = () => {
    if (editingId && editForm.amount) {
      database.updateTransaction(editForm as Transaction);
      setEditingId(null);
      onDelete(); 
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 relative min-h-[400px]">
      {/* Custom Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass p-8 rounded-[2.5rem] w-full max-w-xs shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Delete Transaction?</h3>
            <p className="text-zinc-400 text-sm text-center leading-relaxed mb-8">This action is irreversible and will remove the record from all reports.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => performDelete(showConfirmDelete)}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-rose-600/20 active:scale-95"
              >
                Permanently Delete
              </button>
              <button 
                onClick={() => setShowConfirmDelete(null)}
                className="w-full py-4 glass hover:bg-white/5 text-zinc-300 rounded-2xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {Object.entries(grouped).map(([day, items]) => (
        <div key={day} className="relative">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 bg-zinc-950/80 backdrop-blur sticky top-0 py-1 z-10">{day}</h3>
          
          <div className="space-y-4 pl-4 border-l border-zinc-800 ml-1">
            {(items as Transaction[]).map((item) => (
              <div key={item.id} className="relative group">
                <div 
                  className="absolute -left-[21px] top-8 w-3 h-3 rounded-full border-2 border-zinc-950 z-10 transition-transform group-hover:scale-125"
                  style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#fff' }}
                />
                
                <div className={`glass p-4 rounded-3xl transition-all ${editingId === item.id ? 'ring-2 ring-indigo-500/50 bg-indigo-500/5' : 'hover:bg-white/5'}`}>
                  {editingId === item.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={editForm.amount} 
                          onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                          className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm w-24 outline-none focus:border-indigo-500"
                          autoFocus
                        />
                        <select 
                          value={editForm.category}
                          onChange={e => setEditForm({...editForm, category: e.target.value})}
                          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <input 
                        type="text" 
                        value={editForm.description} 
                        onChange={e => setEditForm({...editForm, description: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
                        placeholder="Description"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-300">Cancel</button>
                        <button onClick={saveEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Save Changes</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${CATEGORY_COLORS[item.category]}15` || '#ffffff15' }}
                        >
                          <span className="text-lg" style={{ color: CATEGORY_COLORS[item.category] }}>
                            {item.category.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">{item.description || item.category}</p>
                          <p className="text-[10px] text-zinc-500 font-medium">{item.category}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <p className={`text-sm font-bold ${item.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-zinc-200'}`}>
                          {item.type === TransactionType.INCOME ? '+' : '-'}₹{item.amount.toLocaleString()}
                        </p>
                        <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => startEdit(item)}
                            className="text-[10px] text-zinc-600 hover:text-indigo-400 uppercase font-bold tracking-wider"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => setShowConfirmDelete(item.id)}
                            className="text-[10px] text-zinc-600 hover:text-rose-500 uppercase font-bold tracking-wider"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {transactions.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-zinc-900/50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-zinc-500 text-sm font-medium">No activity recorded yet.</p>
        </div>
      )}
    </div>
  );
};

export default TransactionTimeline;
