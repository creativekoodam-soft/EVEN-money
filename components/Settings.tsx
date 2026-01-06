
import React, { useState } from 'react';
import { AppState } from '../types';
import { database } from '../services/database';
import { CURRENCIES } from '../constants';

interface SettingsProps {
  state: AppState;
  onUpdate: () => void;
  onExitBook: () => void;
  onLogout: () => void;
  onGlobalReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onUpdate, onExitBook, onLogout, onGlobalReset }) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const updateUserName = (name: string) => {
    database.saveState({ ...state, userName: name });
    onUpdate();
  };

  const updateCurrency = (code: string) => {
    database.saveState({ ...state, currency: code });
    onUpdate();
  };

  const handleGlobalReset = () => {
    setIsResetting(true);
    // Visual feedback delay before clearing state reactively
    setTimeout(() => {
      onGlobalReset();
      setIsResetting(false);
      setShowResetModal(false);
    }, 1500);
  };

  const menuItems = [
    { title: 'Notifications', icon: '🔔' },
    { title: 'Privacy & Security', icon: '🔒' },
    { title: 'Cloud Backup', icon: '☁️' },
    { title: 'Help & Support', icon: '💬' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Global Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass p-8 rounded-[2.5rem] w-full max-w-xs shadow-2xl shadow-rose-900/20 animate-in zoom-in-95 duration-200 border-rose-500/20">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-rose-500/20 relative">
              <div className="absolute inset-0 rounded-[2rem] bg-rose-500/20 animate-ping opacity-20"></div>
              <svg className="w-10 h-10 text-rose-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-black text-center mb-2">Nuclear Reset</h3>
            <p className="text-zinc-400 text-sm text-center leading-relaxed mb-8 font-medium">
              This will wipe <span className="text-white font-bold">ALL</span> books, transactions, and AI memory. This cannot be undone.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleGlobalReset}
                disabled={isResetting}
                className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-600/30 active:scale-95 flex items-center justify-center gap-3"
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Wiping...
                  </>
                ) : (
                  'Confirm & Destroy'
                )}
              </button>
              <button 
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="w-full py-4 glass hover:bg-white/5 text-zinc-400 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center pb-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 mx-auto p-1 mb-4 shadow-xl shadow-indigo-500/20">
          <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-3xl font-black">
            {state.userName.charAt(0)}
          </div>
        </div>
        <div className="relative group inline-block w-full">
          <input 
            type="text" 
            value={state.userName}
            onChange={(e) => updateUserName(e.target.value)}
            className="bg-transparent text-2xl font-black text-center border-none outline-none focus:ring-0 w-full tracking-tight"
          />
          <div className="h-0.5 w-0 group-focus-within:w-1/4 mx-auto bg-indigo-500 transition-all duration-300" />
        </div>
        <p className="text-[10px] text-indigo-400 mt-2 uppercase font-black tracking-[0.2em]">Alpha Contributor</p>
      </div>

      <div className="space-y-3">
        <button 
          onClick={onExitBook}
          className="w-full py-5 rounded-[2rem] glass flex items-center justify-between px-6 hover:bg-white/5 transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl">📚</div>
            <div className="text-left">
              <span className="text-sm font-bold block text-white">Switch Financial Book</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Access your library</span>
            </div>
          </div>
          <svg className="w-5 h-5 text-zinc-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
        </button>

        <button 
          onClick={onLogout}
          className="w-full py-4 rounded-[1.5rem] glass flex items-center justify-center gap-2 px-6 hover:bg-zinc-900 text-zinc-400 transition-all active:scale-[0.98] border border-white/5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Sign Out</span>
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-4">Currency Pivot</label>
        <div className="glass rounded-[2rem] p-2 flex flex-wrap gap-2">
          {CURRENCIES.map(curr => (
            <button
              key={curr.code}
              onClick={() => updateCurrency(curr.code)}
              className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all ${
                state.currency === curr.code ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5 text-zinc-500'
              }`}
            >
              {curr.code}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-4">Core Preferences</label>
        <div className="glass rounded-[2.5rem] overflow-hidden">
          {menuItems.map((item, idx) => (
            <button key={idx} className={`w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors ${idx !== menuItems.length - 1 ? 'border-b border-white/5' : ''}`}>
               <div className="flex items-center gap-4">
                 <span className="text-xl">{item.icon}</span>
                 <span className="text-sm font-bold text-zinc-300">{item.title}</span>
               </div>
               <svg className="w-4 h-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 pb-12 px-2">
        <button 
          onClick={() => setShowResetModal(true)}
          className="w-full py-5 rounded-[2rem] bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20"
        >
          Purge AI Memory & Local Storage
        </button>
        <p className="text-center text-[10px] text-zinc-600 mt-6 px-8 leading-relaxed font-medium uppercase tracking-wider">
          EV.EN Money uses local-first architecture. 
          <br/>Purging is absolute and final.
        </p>
      </div>
    </div>
  );
};

export default Settings;
