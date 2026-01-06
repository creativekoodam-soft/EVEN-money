
import React, { useState, useRef, useEffect } from 'react';
import { parseTransaction } from '../services/gemini';
import { database } from '../services/database';
import { Transaction, TransactionType } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  parsedTransaction?: Partial<Transaction>;
  timestamp: Date;
}

interface AIChatProps {
  onComplete: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hey! I'm your financial assistant. Tell me about your spending or income.", sender: 'ai', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToProcess?: string) => {
    const text = textToProcess || input;
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    const parsed = await parseTransaction(text);
    
    if (parsed && parsed.amount) {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `Got it! I've detected a ${parsed.type} of ₹${parsed.amount} for ${parsed.category}. Should I save this?`,
        sender: 'ai',
        parsedTransaction: parsed,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } else {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I couldn't quite catch the amount or type. Try saying something like 'Spent 200 on lunch'.",
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
    setIsProcessing(false);
  };

  const confirmTransaction = (transaction: Partial<Transaction>) => {
    database.addTransaction({
      id: Date.now().toString(),
      amount: transaction.amount || 0,
      category: transaction.category || 'Other',
      date: transaction.date || new Date().toISOString(),
      type: transaction.type || TransactionType.EXPENSE,
      description: transaction.description || 'AI Entry',
      isConfirmed: true
    });
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: "✅ Transaction saved to your current book!",
      sender: 'ai',
      timestamp: new Date()
    }]);
    
    setTimeout(() => onComplete(), 1000);
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'glass text-zinc-300 rounded-bl-none'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              
              {msg.parsedTransaction && (
                <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Preview</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      msg.parsedTransaction.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {msg.parsedTransaction.type?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-lg font-bold">₹{msg.parsedTransaction.amount}</p>
                      <p className="text-xs text-zinc-400">{msg.parsedTransaction.category}</p>
                    </div>
                    <button 
                      onClick={() => confirmTransaction(msg.parsedTransaction!)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
             <div className="glass p-3 rounded-2xl flex gap-1">
               <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
               <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]" />
               <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
          </div>
        )}
      </div>

      <div className="mt-6 glass rounded-full p-2 flex items-center gap-2 mb-4">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Spent 500 on dinner..."
          className="flex-1 bg-transparent border-none outline-none text-sm px-4 text-zinc-300"
        />
        <button 
          onClick={startVoice}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isListening ? 'bg-rose-500 animate-pulse' : 'bg-zinc-800 text-zinc-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <button 
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIChat;
