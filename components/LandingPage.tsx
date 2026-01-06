
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col h-full justify-between py-12 px-6 animate-in fade-in duration-1000">
      <div className="relative z-10 space-y-8 mt-12">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">EV.EN <span className="gradient-text">Money</span></h1>
        </div>

        <div className="space-y-4">
          <h2 className="text-5xl font-black tracking-tight leading-[0.95]">
            Talk to your <br/>
            <span className="text-zinc-500">Wealth.</span>
          </h2>
          <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-[280px]">
            AI-first personal finance that feels like a conversation, not a chore.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-5 rounded-[2rem] space-y-2">
            <div className="text-2xl">🎙️</div>
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Voice Input</p>
          </div>
          <div className="glass p-5 rounded-[2rem] space-y-2">
            <div className="text-2xl">🧠</div>
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">AI Insights</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-6">
        <button 
          onClick={onStart}
          className="w-full py-6 bg-indigo-600 rounded-[2.5rem] text-lg font-black text-white shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 transition-all"
        >
          Begin Your Journey
        </button>
        <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
          Private • Local-first • Powered by AI
        </p>
      </div>

      {/* Decorative background mesh */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default LandingPage;
