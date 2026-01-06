
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Book } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CATEGORY_COLORS } from '../constants';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

interface ReportsProps {
  transactions: Transaction[];
  books: Book[];
  currentBookId: string | null;
  currency: string;
}

const Reports: React.FC<ReportsProps> = ({ transactions, books, currentBookId, currency }) => {
  const [range, setRange] = useState('month');
  const [scope, setScope] = useState<'current' | 'global'>(currentBookId ? 'current' : 'global');
  const [exporting, setExporting] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    if (scope === 'global') return transactions;
    return transactions.filter(t => t.bookId === currentBookId);
  }, [transactions, scope, currentBookId]);

  const chartData = useMemo(() => {
    const data: Record<string, { income: number; expense: number }> = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      let key = '';
      if (range === 'month') key = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      else if (range === 'year') key = date.toLocaleDateString('en-US', { month: 'short' });
      else key = date.toLocaleDateString('en-US', { weekday: 'short' });

      if (!data[key]) data[key] = { income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) data[key].income += t.amount;
      else data[key].expense += t.amount;
    });

    return Object.entries(data).map(([name, vals]) => ({ name, ...vals })).slice(-7);
  }, [filteredTransactions, range]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  const totalIncome = useMemo(() => filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s,t) => s+t.amount, 0), [filteredTransactions]);
  const totalExpense = useMemo(() => filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s,t) => s+t.amount, 0), [filteredTransactions]);
  const balance = totalIncome - totalExpense;

  const exportPDF = async () => {
    setExporting('PDF');
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleDateString();
      const currencySymbol = currency === 'INR' ? 'Rs.' : '$';
      const isGlobal = scope === 'global';
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text("EV.EN Money", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(120);
      const reportTitle = isGlobal ? "Global Wealth Portfolio Report" : "Single Book Activity Report";
      doc.text(`${reportTitle} | Generated: ${timestamp}`, 20, 28);
      
      // Summary Box
      doc.setDrawColor(240);
      doc.setFillColor(252, 252, 252);
      doc.roundedRect(20, 35, 170, 45, 3, 3, 'FD');
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(isGlobal ? "Global Net Worth" : "Ledger Summary", 25, 45);
      
      doc.setFontSize(10);
      doc.text(`Aggregated Credits:`, 25, 55);
      doc.setTextColor(16, 185, 129); // Emerald-500
      doc.text(`${currencySymbol} ${totalIncome.toLocaleString()}`, 100, 55);
      
      doc.setTextColor(0);
      doc.text(`Aggregated Debits:`, 25, 62);
      doc.setTextColor(244, 63, 94); // Rose-500
      doc.text(`${currencySymbol} ${totalExpense.toLocaleString()}`, 100, 62);
      
      doc.setTextColor(0);
      doc.text(`Consolidated Position:`, 25, 69);
      doc.setFontSize(11);
      doc.text(`${currencySymbol} ${balance.toLocaleString()}`, 100, 69);

      // Transactions Table
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(isGlobal ? "Cross-Book Activity" : "Recent Transactions", 20, 95);
      
      let y = 105;
      doc.setFontSize(8);
      doc.setTextColor(80);
      
      // Table Header
      doc.text("Date", 20, y);
      if (isGlobal) doc.text("Book", 45, y);
      doc.text("Category", isGlobal ? 80 : 50, y);
      doc.text("Amount", 160, y);
      
      y += 2;
      doc.line(20, y, 190, y);
      y += 8;

      filteredTransactions.slice(0, 50).forEach(t => {
        if (y > 275) { doc.addPage(); y = 20; }
        
        const book = books.find(b => b.id === t.bookId);
        doc.setTextColor(100);
        doc.text(`${new Date(t.date).toLocaleDateString()}`, 20, y);
        if (isGlobal) doc.text(`${book?.name || 'Unknown'}`, 45, y);
        doc.text(`${t.category}`, isGlobal ? 80 : 50, y);
        
        doc.setTextColor(t.type === 'income' ? 16 : 244, t.type === 'income' ? 185 : 63, t.type === 'income' ? 129 : 94);
        doc.text(`${t.type === 'income' ? '+' : '-'}${currencySymbol}${t.amount.toLocaleString()}`, 160, y);
        
        y += 7;
      });

      doc.save(`EVEN_Wealth_Report_${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error("PDF Export Error:", e);
      alert("Failed to generate PDF.");
    } finally {
      setExporting(null);
    }
  };

  const exportExcel = () => {
    setExporting('XLS');
    try {
      const data = filteredTransactions.map(t => {
        const book = books.find(b => b.id === t.bookId);
        return {
          Date: new Date(t.date).toLocaleDateString(),
          Book: book?.name || 'N/A',
          Type: t.type.toUpperCase(),
          Category: t.category,
          Amount: t.amount,
          Currency: currency,
          Description: t.description || 'AI Entry'
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Financial Data");
      
      const colWidths = [ {wch: 12}, {wch: 15}, {wch: 10}, {wch: 15}, {wch: 12}, {wch: 8}, {wch: 30} ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `EVEN_Global_Export_${new Date().getTime()}.xlsx`);
    } catch (e) {
      console.error("Excel Export Error:", e);
      alert("Failed to generate Excel file.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      {/* Scope Selector */}
      <div className="flex flex-col gap-4 no-print">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Consolidated <span className="gradient-text">Reports</span></h2>
          <div className="flex gap-1 glass p-1 rounded-xl">
            <button
              onClick={() => setScope('current')}
              disabled={!currentBookId}
              className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg transition-all ${
                scope === 'current' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-20'
              }`}
            >
              This Book
            </button>
            <button
              onClick={() => setScope('global')}
              className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-lg transition-all ${
                scope === 'global' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Global Wealth
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
           <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest">Selected Period</span>
              <div className="flex gap-2 mt-1">
                {['week', 'month', 'year'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`text-[10px] uppercase font-bold transition-colors ${
                      range === r ? 'text-indigo-400 underline underline-offset-4' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
           </div>
           <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest">Net Position</span>
              <p className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currency === 'INR' ? '₹' : '$'}{balance.toLocaleString()}
              </p>
           </div>
        </div>
      </div>

      <div className="glass p-5 rounded-[2rem] h-64 chart-container border-white/5 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a' }} />
            <YAxis hide />
            <Tooltip 
               contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '16px', fontSize: '10px' }}
               itemStyle={{ color: '#fff' }}
               cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            />
            <Bar dataKey="expense" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#f43f5e" fillOpacity={0.8} />
              ))}
            </Bar>
            <Bar dataKey="income" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#10b981" fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-400 ml-2">Spending Breakdown</h3>
        <div className="grid grid-cols-1 gap-3">
          {categoryBreakdown.map(([cat, val]) => (
            <div key={cat} className="glass p-4 rounded-[1.5rem] flex items-center justify-between group hover:bg-white/5 transition-colors border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 rounded-full transition-all group-hover:scale-y-110" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                <div>
                  <p className="text-sm font-bold text-zinc-200">{cat}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    {totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0}% share
                  </p>
                </div>
              </div>
              <p className="text-sm font-black tracking-tight">{currency === 'INR' ? '₹' : '$'}{val.toLocaleString()}</p>
            </div>
          ))}
          {categoryBreakdown.length === 0 && (
            <div className="text-center py-10 glass rounded-[1.5rem] opacity-40 border-dashed border">
              <p className="text-xs">No wealth data available for this range.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 grid grid-cols-3 gap-3 no-print">
        <button 
          onClick={exportPDF} 
          disabled={!!exporting}
          className="glass p-5 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-white/5 disabled:opacity-50 transition-all active:scale-95 group border-white/5"
        >
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
            <svg className={`w-5 h-5 ${exporting === 'PDF' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            {exporting === 'PDF' ? 'Generating...' : 'PDF Doc'}
          </span>
        </button>
        
        <button 
          onClick={() => {}} 
          disabled={true}
          className="glass p-5 rounded-[2rem] flex flex-col items-center gap-2 opacity-50 border-white/5"
        >
           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CSV Data</span>
        </button>

        <button 
          onClick={exportExcel} 
          disabled={!!exporting}
          className="glass p-5 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-white/5 disabled:opacity-50 transition-all active:scale-95 group border-white/5"
        >
           <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <svg className={`w-5 h-5 ${exporting === 'XLS' ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            {exporting === 'XLS' ? 'Ledger...' : 'Excel'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Reports;
