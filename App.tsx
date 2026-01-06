
import React, { useState, useEffect } from 'react';
import { View, AppState } from './types';
import { database, DEFAULT_STATE } from './services/database';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import AIChat from './components/AIChat';
import TransactionTimeline from './components/TransactionTimeline';
import Reports from './components/Reports';
import Insights from './components/Insights';
import Settings from './components/Settings';
import BookSelector from './components/BookSelector';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(database.getState());
  const [view, setView] = useState<View>(() => {
    const s = database.getState();
    if (!s.isLoggedIn) return 'landing';
    return s.currentBookId ? 'dashboard' : 'book_selector';
  });

  const refreshState = () => {
    setState(database.getState());
  };

  useEffect(() => {
    refreshState();
  }, [view]);

  // Handle book switching
  const handleSelectBook = (id: string) => {
    database.setCurrentBook(id);
    refreshState();
    setView('dashboard');
  };

  const handleExitBook = () => {
    database.setCurrentBook(null);
    refreshState();
    setView('book_selector');
  };

  const handleLogout = () => {
    database.logout();
    refreshState();
    setView('landing');
  };

  const handleGlobalReset = () => {
    database.clearAll();
    setState(DEFAULT_STATE);
    setView('landing');
  };

  const currentBook = state.books.find(b => b.id === state.currentBookId);
  const activeTransactions = database.getActiveTransactions();
  const activeInsights = database.getActiveInsights();

  const renderView = () => {
    // Top-level routing for auth
    if (!state.isLoggedIn) {
      if (view === 'login') return <LoginPage onLogin={() => setView('book_selector')} />;
      return <LandingPage onStart={() => setView('login')} />;
    }

    if (view === 'book_selector') {
      return (
        <BookSelector 
          books={state.books} 
          onSelect={handleSelectBook} 
          onRefresh={refreshState} 
        />
      );
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard transactions={activeTransactions} insights={activeInsights} currency={state.currency} onQuickAdd={() => setView('chat')} />;
      case 'chat':
        return <AIChat onComplete={refreshState} />;
      case 'timeline':
        return <TransactionTimeline transactions={activeTransactions} onDelete={refreshState} />;
      case 'reports':
        return (
          <Reports 
            transactions={state.transactions} 
            books={state.books}
            currentBookId={state.currentBookId}
            currency={state.currency} 
          />
        );
      case 'insights':
        return <Insights transactions={activeTransactions} />;
      case 'settings':
        return <Settings state={state} onUpdate={refreshState} onExitBook={handleExitBook} onLogout={handleLogout} onGlobalReset={handleGlobalReset} />;
      default:
        return <Dashboard transactions={activeTransactions} insights={activeInsights} currency={state.currency} onQuickAdd={() => setView('chat')} />;
    }
  };

  const isCoreView = state.isLoggedIn && view !== 'book_selector';
  const showHeader = state.isLoggedIn;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative overflow-hidden bg-zinc-950 border-x border-zinc-800 shadow-2xl shadow-black">
      {/* App Header */}
      {showHeader && (
        <header className="p-6 flex justify-between items-center z-10 animate-in fade-in duration-500">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter">
              {view === 'book_selector' ? (
                <>EV.EN <span className="gradient-text">Money</span></>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-xl">{currentBook?.emoji}</span>
                  <span className="truncate max-w-[150px]">{currentBook?.name}</span>
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
              {view === 'book_selector' ? `Welcome back, ${state.userName}` : 'Active Book'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {view !== 'book_selector' && (
              <button 
                onClick={handleExitBook}
                className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Switch Book"
              >
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            )}
            <button onClick={() => setView('settings')} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>
      )}

      {/* View Content */}
      <main className={`flex-1 overflow-y-auto relative ${showHeader ? 'pb-24 px-6' : ''}`}>
        {renderView()}
      </main>

      {/* Bottom Floating AI Button */}
      {isCoreView && view !== 'chat' && (
        <button 
          onClick={() => setView('chat')}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-indigo-600 shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 group"
        >
          <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20 group-hover:opacity-40"></div>
          <svg className="w-8 h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Mobile Navigation */}
      {isCoreView && <Navigation currentView={view} setView={setView} />}
    </div>
  );
};

export default App;
