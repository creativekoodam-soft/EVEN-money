
import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { database } from '../services/database';

interface BookSelectorProps {
  books: Book[];
  onSelect: (bookId: string) => void;
  onRefresh: () => void;
}

const BookSelector: React.FC<BookSelectorProps> = ({ books, onSelect, onRefresh }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newBook, setNewBook] = useState({ name: '', emoji: '💰', color: '#4f46e5' });
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const colors = ['#4f46e5', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4'];
  const emojis = ['💰', '🏠', '🚗', '🍔', '✈️', '🎮', '❤️', '💼'];

  const globalStats = useMemo(() => database.getGlobalStats(), [books]);
  const currencySymbol = '₹'; // Defaulting to INR for visual consistency, could be dynamic

  const handleCreate = () => {
    if (!newBook.name.trim()) return;
    database.createBook(newBook.name, newBook.emoji, newBook.color);
    setIsCreating(false);
    setNewBook({ name: '', emoji: '💰', color: '#4f46e5' });
    onRefresh();
  };

  const initiateDelete = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    setBookToDelete(book);
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      database.deleteBook(bookToDelete.id);
      setBookToDelete(null);
      onRefresh();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass p-8 rounded-[2.5rem] w-full max-w-xs shadow-2xl shadow-black animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-2">Delete "{bookToDelete.name}"?</h3>
            <p className="text-zinc-400 text-sm text-center leading-relaxed mb-8">
              All transactions and insights within this book will be permanently lost.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDelete}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-rose-600/20 active:scale-95"
              >
                Delete Everything
              </button>
              <button 
                onClick={() => setBookToDelete(null)}
                className="w-full py-4 glass hover:bg-white/5 text-zinc-300 rounded-2xl text-sm font-bold transition-all"
              >
                Keep Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Portfolio Hero */}
      <div className="relative p-8 rounded-[2.5rem] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90 group-hover:scale-105 transition-transform duration-700"></div>
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">Global Wealth</span>
            <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse delay-75"></div>
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              {currencySymbol}{globalStats.totalBalance.toLocaleString()}
            </h2>
            <p className="text-indigo-100/60 text-xs font-medium mt-1">Aggregated across {globalStats.bookCount} books</p>
          </div>

          <div className="pt-2 flex gap-4">
             <div className="flex flex-col">
                <span className="text-[9px] text-indigo-200/50 uppercase font-bold">Activity</span>
                <span className="text-sm font-bold text-white">{globalStats.transactionCount} entries</span>
             </div>
             <div className="w-px h-8 bg-white/10"></div>
             <div className="flex flex-col">
                <span className="text-[9px] text-indigo-200/50 uppercase font-bold">Insights</span>
                <span className="text-sm font-bold text-white">AI Active</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold">Your <span className="gradient-text">Shelf</span></h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl glass hover:bg-white/10 transition-all active:scale-95 group"
          >
            <svg className="w-4 h-4 text-indigo-400 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Add Book</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="glass p-6 rounded-[2.5rem] space-y-5 animate-in zoom-in-95 duration-300 border-indigo-500/20 border-2">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">New Ledger</h3>
            <button onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-2xl">
                    {newBook.emoji}
                </div>
                <input 
                    type="text" 
                    placeholder="E.g. Business Expenses" 
                    value={newBook.name}
                    onChange={e => setNewBook({...newBook, name: e.target.value})}
                    className="w-full bg-zinc-900/50 border border-white/10 rounded-[1.5rem] p-4 pl-14 text-sm outline-none focus:border-indigo-500 transition-all"
                    autoFocus
                />
            </div>
            
            <div className="space-y-3">
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Iconography</p>
                <div className="flex flex-wrap gap-2">
                {emojis.map(e => (
                    <button 
                    key={e} 
                    onClick={() => setNewBook({...newBook, emoji: e})}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all ${newBook.emoji === e ? 'bg-indigo-600 scale-110 shadow-xl shadow-indigo-600/30' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                    {e}
                    </button>
                ))}
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Theme Accent</p>
                <div className="flex gap-3">
                {colors.map(c => (
                    <button 
                    key={c} 
                    onClick={() => setNewBook({...newBook, color: c})}
                    className={`w-9 h-9 rounded-full border-4 transition-all ${newBook.color === c ? 'border-white scale-125' : 'border-transparent opacity-40 hover:opacity-80'}`}
                    style={{ backgroundColor: c }}
                    />
                ))}
                </div>
            </div>
          </div>

          <button onClick={handleCreate} className="w-full py-5 bg-indigo-600 rounded-[1.5rem] text-sm font-black text-white shadow-xl shadow-indigo-600/30 active:scale-95 transition-all mt-4">
            Initialize Book
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        {books.map(book => {
          const stats = database.getBookStats(book.id);
          return (
            <div 
              key={book.id}
              onClick={() => onSelect(book.id)}
              className="glass p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/5 active:scale-[0.98] transition-all relative overflow-hidden cursor-pointer border border-white/5 hover:border-white/10"
            >
              {/* Decorative background circle */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: book.color }} />
              
              <div className="flex items-center gap-5 relative z-10">
                <div 
                  className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110 duration-500"
                  style={{ backgroundColor: `${book.color}20` }}
                >
                  <span className="drop-shadow-lg">{book.emoji}</span>
                </div>
                
                <div>
                  <h4 className="font-bold text-lg text-white group-hover:translate-x-1 transition-transform">{book.name}</h4>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs font-black ${stats.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stats.balance >= 0 ? '+' : ''}{currencySymbol}{stats.balance.toLocaleString()}
                    </span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stats.count} entries</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                <button 
                  onClick={(e) => initiateDelete(e, book)}
                  className="opacity-0 group-hover:opacity-100 p-3 text-zinc-600 hover:text-rose-500 transition-all hover:scale-125"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                    <svg className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
              </div>
            </div>
          );
        })}

        {books.length === 0 && !isCreating && (
          <div 
            onClick={() => setIsCreating(true)}
            className="text-center py-20 glass rounded-[2.5rem] border-dashed border-2 border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
          >
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <span className="text-4xl opacity-40 group-hover:opacity-100 transition-opacity">✨</span>
            </div>
            <h3 className="text-zinc-300 font-bold text-lg">Ready to begin?</h3>
            <p className="text-zinc-500 text-sm mt-1 px-12">Create your first financial ledger to start tracking with AI.</p>
            <button className="mt-8 px-8 py-3 bg-indigo-600 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20">
                Setup First Book
            </button>
          </div>
        )}
      </div>

      {/* Quick Tips Footer */}
      {books.length > 0 && (
          <div className="px-4 py-6 border-t border-white/5 mt-8">
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-4">Pro Tip</p>
              <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed italic">
                    "Use separate books for personal and work to get sharper AI insights on your tax deductions."
                  </p>
              </div>
          </div>
      )}
    </div>
  );
};

export default BookSelector;
