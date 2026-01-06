
import React, { useMemo, useEffect, useRef } from 'react';
import { Transaction, TransactionType, Insight } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import * as d3 from 'd3';
import { CATEGORY_COLORS } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  insights: Insight[];
  currency: string;
  onQuickAdd: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, insights, currency, onQuickAdd }) => {
  const bubbleRef = useRef<SVGSVGElement>(null);

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    return {
      total: income - expense,
      income,
      expense,
      ratio: income > 0 ? (expense / income) * 100 : 0
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === TransactionType.EXPENSE).forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  useEffect(() => {
    if (!bubbleRef.current || categoryData.length === 0) return;

    const width = 350;
    const height = 250;
    const svg = d3.select(bubbleRef.current);
    svg.selectAll("*").remove();

    const pack = d3.pack().size([width, height]).padding(2);
    const root = d3.hierarchy({ children: categoryData }).sum((d: any) => d.value);
    const nodes = pack(root).leaves();

    const g = svg.append("g");

    const node = g.selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`);

    node.append("circle")
      .attr("r", (d: any) => d.r)
      .style("fill", (d: any) => CATEGORY_COLORS[d.data.name] || "#4f46e5")
      .style("opacity", 0.7)
      .style("stroke", "#fff")
      .style("stroke-width", "0.5px");

    node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .style("font-size", (d: any) => Math.min(d.r / 3, 10))
      .style("fill", "#fff")
      .style("font-weight", "600")
      .text((d: any) => d.r > 20 ? d.data.name : "");

  }, [categoryData]);

  // Spending Heatmap (Last 30 days)
  const heatmapData = useMemo(() => {
    const days = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const dailyExpense = transactions
        .filter(t => t.type === TransactionType.EXPENSE && t.date.startsWith(dayStr))
        .reduce((s, t) => s + t.amount, 0);
      return { date: dayStr, value: dailyExpense };
    }).reverse();
    return days;
  }, [transactions]);

  const getIntensity = (val: number) => {
    if (val === 0) return 'bg-zinc-800/50';
    if (val < 100) return 'bg-indigo-900/40';
    if (val < 500) return 'bg-indigo-700/60';
    if (val < 1000) return 'bg-indigo-500/80';
    return 'bg-indigo-400';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Total Balance Card */}
      <div className="glass p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -m-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-zinc-400 text-sm font-medium">Total Balance</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold tracking-tight">
                {currency === 'INR' ? '₹' : '$'}
                {stats.total.toLocaleString()}
              </span>
            </div>
          </div>
          <button 
            onClick={onQuickAdd}
            className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all border border-indigo-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Quick Add
          </button>
        </div>
        
        <div className="mt-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stats.income > stats.expense ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {stats.income > stats.expense ? '↑' : '↓'} {(Math.abs(stats.ratio)).toFixed(0)}% flow
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/5 p-3 rounded-2xl">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Income</p>
            <p className="text-emerald-400 font-bold">+{currency === 'INR' ? '₹' : '$'}{stats.income.toLocaleString()}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Expense</p>
            <p className="text-rose-400 font-bold">-{currency === 'INR' ? '₹' : '$'}{stats.expense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Income vs Expense Flow */}
      <div className="glass p-5 rounded-3xl">
        <h3 className="text-sm font-semibold mb-4 text-zinc-300">Financial Flow</h3>
        <div className="h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Income', value: stats.income },
                  { name: 'Expense', value: stats.expense }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f43f5e" />
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bubble Chart */}
      <div className="glass p-5 rounded-3xl">
        <h3 className="text-sm font-semibold mb-2 text-zinc-300">Spending Bubbles</h3>
        <div className="flex justify-center overflow-hidden">
          <svg ref={bubbleRef} width="350" height="250" />
        </div>
      </div>

      {/* Heatmap */}
      <div className="glass p-5 rounded-3xl">
        <h3 className="text-sm font-semibold mb-3 text-zinc-300">Spending Heat Map</h3>
        <div className="grid grid-cols-7 gap-1">
          {heatmapData.map((day, i) => (
            <div 
              key={i} 
              title={`${day.date}: ${day.value}`}
              className={`w-full aspect-square rounded-[4px] ${getIntensity(day.value)} transition-colors`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-zinc-500 uppercase font-bold">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* AI Insight Card */}
      {insights.length > 0 && (
        <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-3xl relative overflow-hidden">
          <div className="flex gap-3 items-start">
             <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
               <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
             </div>
             <div>
               <h4 className="text-sm font-bold text-indigo-300">{insights[0].title}</h4>
               <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{insights[0].content}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
