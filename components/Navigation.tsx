
import React from 'react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const tabs = [
    { id: 'dashboard', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ), label: 'Home' },
    { id: 'timeline', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ), label: 'Activity' },
    { id: 'chat', icon: (
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
         </svg>
      </div>
    ), label: 'Chat' },
    { id: 'reports', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ), label: 'Reports' },
    { id: 'insights', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ), label: 'AI' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 glass h-20 px-4 flex items-center justify-between z-30">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id as View)}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all ${
            currentView === tab.id ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {tab.icon}
          <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          {currentView === tab.id && (
            <div className="absolute top-0 w-8 h-0.5 bg-indigo-400 rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
