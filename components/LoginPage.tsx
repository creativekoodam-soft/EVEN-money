
import React, { useState } from 'react';
import { database } from '../services/database';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setTimeout(() => {
      database.login(name);
      onLogin();
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full justify-center px-8 animate-in zoom-in-95 duration-500">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
          <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black tracking-tight mb-2">Identify Yourself</h2>
        <p className="text-zinc-500 font-medium">Create your secure local profile.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Full Name</label>
          <input 
            type="text" 
            placeholder="E.g. Alex Henderson" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/10 rounded-[1.5rem] p-5 text-sm outline-none focus:border-indigo-500 transition-all focus:ring-4 ring-indigo-500/10"
            required
            autoFocus
          />
        </div>

        <button 
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full py-5 bg-indigo-600 rounded-[2rem] text-sm font-black text-white shadow-xl shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>Setup Account</>
          )}
        </button>
      </form>

      <div className="mt-12 p-6 glass rounded-[2.5rem] border-indigo-500/10 border">
        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
          <span className="text-zinc-300 font-bold">Privacy First:</span> Your data never leaves this device. We use local encryption to keep your finances truly personal.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
