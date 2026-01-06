
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { getAIInsights } from '../services/gemini';

interface InsightsProps {
  transactions: Transaction[];
}

const Insights: React.FC<InsightsProps> = ({ transactions }) => {
  const [insightText, setInsightText] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const text = await getAIInsights(transactions);
      setInsightText(text);
      setLoading(false);
    };
    fetch();
  }, [transactions]);

  const mockInsightCards = [
    { title: "Monthly Summary", content: "You've spent ₹12,400 this month, which is 10% lower than your average. Great job!", type: 'success' },
    { title: "Budget Warning", content: "You've used 85% of your 'Dining Out' budget already. Maybe cook at home tonight?", type: 'warning' },
    { title: "Smart Suggestion", content: "If you move ₹5,000 to an index fund, you could earn an extra ₹400/year.", type: 'info' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="relative glass p-8 rounded-[2rem] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674a1 1 0 00.951-.688l1.396-4.707A1 1 0 0015.733 10H12.5V3.122a1 1 0 00-1.636-.772L4.01 10.154A1 1 0 004.836 12H8v4.663a1 1 0 001.663.837z" />
          </svg>
          Gemini Intelligence
        </h2>
        
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-white/5 rounded-full w-full animate-pulse" />
            <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse" />
          </div>
        ) : (
          <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line prose prose-invert">
            {insightText}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {mockInsightCards.map((card, idx) => (
          <div key={idx} className="glass p-5 rounded-3xl relative">
             <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full ${
               card.type === 'success' ? 'bg-emerald-500' : card.type === 'warning' ? 'bg-rose-500' : 'bg-indigo-500'
             }`} />
             <h4 className="text-sm font-bold text-zinc-100 mb-1">{card.title}</h4>
             <p className="text-xs text-zinc-400 leading-relaxed">{card.content}</p>
          </div>
        ))}
      </div>

      <button className="w-full py-4 rounded-3xl border border-white/10 glass text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
        Refresh Analysis
      </button>
    </div>
  );
};

export default Insights;
