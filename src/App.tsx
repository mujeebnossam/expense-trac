import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Expense, CategoryBudget } from "./types";
import { INITIAL_EXPENSES, INITIAL_BUDGETS } from "./mockData";
import ReceiptScanner from "./components/ReceiptScanner";
import BudgetVisualizer from "./components/BudgetVisualizer";
import ExpenseLedger from "./components/ExpenseLedger";
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  Sparkles, 
  User, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  RefreshCw,
  Trash2,
  PieChart,
  LayoutGrid,
  Zap,
  Flame,
  LineChart,
  Grid
} from "lucide-react";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const cached = localStorage.getItem("expense_ledger_data");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached expenses, falling back to mock data.", e);
      }
    }
    return INITIAL_EXPENSES();
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const cached = localStorage.getItem("expense_budget_limits");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached budgets, falling back to initial.", e);
      }
    }
    return INITIAL_BUDGETS;
  });

  const [userName, setUserName] = useState("Mujeeb Nossam");
  const [currencySymbol, setCurrencySymbol] = useState("$");

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem("expense_ledger_data", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("expense_budget_limits", JSON.stringify(budgets));
  }, [budgets]);

  // Handle adding expenses
  const handleAddExpense = (newExpenseRaw: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...newExpenseRaw,
      id: "exp-" + Date.now() + Math.random().toString(36).substr(2, 4),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleUpdateBudget = (category: string, newLimit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit: newLimit } : b))
    );
  };

  const handleLoadSampleData = () => {
    if (window.confirm("This will load realistic sample records. Current entries will be overwritten. Proceed?")) {
      setExpenses(INITIAL_EXPENSES());
      setBudgets(INITIAL_BUDGETS);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm("Are you sure you want to completely erase all transactions? This cannot be undone.")) {
      setExpenses([]);
      localStorage.removeItem("expense_ledger_data");
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ["ID", "Merchant", "Date", "Category", "Amount", "Payment Method", "Notes"];
      const rows = expenses.map(e => [
        e.id,
        `"${e.merchant.replace(/"/g, '""')}"`,
        e.date,
        e.category,
        e.amount,
        `"${e.paymentMethod.replace(/"/g, '""')}"`,
        `"${(e.notes || "").replace(/"/g, '""')}"`
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Expense_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export CSV file.");
    }
  };

  // Calculations
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalLeft = Math.max(0, totalBudget - totalSpent);
  const spentRatio = totalBudget > 0 ? (totalSpent / totalBudget) : 0;
  
  // Category-specific calculation for Insights
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as { [cat: string]: number });

  let topCategoryName = "None";
  let topCategoryValue = 0;
  let topCategoryPercentage = 0;

  Object.entries(categoryTotals).forEach(([cat, val]) => {
    const valNum = val as number;
    if (valNum > topCategoryValue) {
      topCategoryValue = valNum;
      topCategoryName = cat;
    }
  });

  if (totalSpent > 0 && topCategoryValue > 0) {
    topCategoryPercentage = Math.round((topCategoryValue / totalSpent) * 100);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-y-auto selection:bg-emerald-500 selection:text-slate-950 pb-12">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        
        {/* Top Figma Design Workspace Header Bar */}
        <header id="figma-header-bar" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-md">
              <Wallet className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-display font-bold tracking-tight text-white leading-none">
                  EXPENSE<span className="text-emerald-400 font-extrabold text-shadow-glow">PRO</span>
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wider font-mono">
                  FIGMA COMPLIANT
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">
                Unified Live Workspace • June 2026
              </p>
            </div>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl self-end sm:self-auto">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-[11px] font-display">
              MN
            </div>
            <div className="text-left pr-1">
              <p className="text-xs font-bold text-white leading-none">{userName}</p>
              <p className="text-[8.5px] text-emerald-400 font-bold mt-0.5 uppercase tracking-widest">Premium Member</p>
            </div>
          </div>
        </header>

        {/* Triple Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card A: Total Budget */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between relative overflow-hidden h-36">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none font-mono">LIMIT TARGET</span>
                <h3 className="text-2xl mt-2 font-display font-bold text-white leading-none">
                  {currencySymbol}{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                <LayoutGrid className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800/60 pt-3">
              <span className="font-semibold text-slate-500 uppercase font-mono">Target Threshold</span>
              <span className="font-bold text-emerald-400 uppercase tracking-wider font-mono">Active tracking</span>
            </div>
          </div>

          {/* Card B: Spending */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between relative overflow-hidden h-36">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none font-mono">CUMULATIVE OUTLAY</span>
                <h3 className="text-2xl mt-2 font-display font-bold text-white leading-none">
                  {currencySymbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                <ArrowUpRight className="w-4 h-4 text-rose-500" />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800/60 pt-3">
              <span className="font-semibold text-slate-500 uppercase font-mono">Live Logs Count</span>
              <span className="font-bold text-slate-300 font-mono">{expenses.length} Records</span>
            </div>
          </div>

          {/* Card C: Remainder */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between relative overflow-hidden h-36">
            <div className="absolute top-1 right-1 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none font-mono">INTACT SURPLUS</span>
                <h3 className="text-2xl mt-2 font-display font-bold text-white leading-none">
                  {currencySymbol}{totalLeft.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                <ArrowDownRight className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800/60 pt-3">
              <span className="font-semibold text-slate-500 uppercase font-mono">Usage reserve</span>
              <span className="font-bold text-cyan-400 font-mono">
                {totalBudget > 0 ? Math.round((totalLeft / totalBudget) * 100) : 0}% remaining
              </span>
            </div>
          </div>

        </div>

        {/* Real-time Widescreen Bento Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Wing (Receipt Scanner && Ledger lists combined) - col-span 7 */}
          <section id="scanner-and-ledger" className="lg:col-span-7 flex flex-col gap-6">
            <ReceiptScanner onAddExpense={handleAddExpense} />
            
            <ExpenseLedger 
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </section>

          {/* Right Wing (Budget SVGs, category bars, and micro insights) - col-span 5 */}
          <section id="budget-breakdowns-and-insights" className="lg:col-span-5 flex flex-col gap-6">
            
            <BudgetVisualizer 
              expenses={expenses}
              budgets={budgets}
              onUpdateBudget={handleUpdateBudget}
            />

            {/* Micro bento cluster insights panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Category card (Emerald glow) */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex justify-between items-start">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <span className="text-[8.5px] uppercase tracking-widest font-extrabold text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-lg bg-emerald-500/5">
                    TOP SECTOR
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">MAX SECTOR SPEND</p>
                  <p className="text-base font-bold text-white font-display mt-1">{topCategoryName}</p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-850 pt-2.5 mt-2 font-mono">
                  <span>Usage share</span>
                  <span className="font-bold text-white">{topCategoryPercentage}%</span>
                </div>
              </div>

              {/* Quick Config Profile card (Indigo glow) */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[140px]">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex justify-between items-start">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[8.5px] uppercase tracking-widest font-extrabold text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-lg bg-indigo-500/5">
                    PROFILE INFO
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">DISPLAY INDENT</span>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-transparent border-b border-transparent focus:border-indigo-500/50 hover:border-slate-800 focus:outline-none text-white font-bold text-xs mt-1 py-0.5 font-display w-full"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-850 pt-2.5 mt-2 font-mono">
                  <span>Sign tag:</span>
                  <span className="text-indigo-400 font-bold uppercase tracking-wider">CURR: {currencySymbol}</span>
                </div>
              </div>

            </div>

            {/* AI Advisor Assessment advice card */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent blur-xl pointer-events-none"></div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">AI Coach Assessment</h3>
                  <p className="text-[9.5px] text-slate-500 font-bold uppercase tracking-widest">GEMINI ADVISOR METRICS</p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed space-y-3 font-mono">
                <p className="text-emerald-400 font-medium">✓ Real-time status: Healthy reserves</p>
                <p className="text-[11px]">
                  Daily burn rate average sets to <span className="text-white font-bold">{currencySymbol}{(totalSpent / 30).toFixed(2)}</span> calculated monthly projection. Excellent allocation observed.
                </p>
                {topCategoryValue > 0 && (
                  <p className="border-t border-slate-900 pt-2.5 text-[11px]">
                    ⚠️ Sector warning: <span className="text-white font-bold">{topCategoryName}</span> accounts for <span className="text-rose-400 font-semibold">{topCategoryPercentage}%</span> of gross spending. We suggest trimming this sector by 15% to safeguard remaining intact.
                  </p>
                )}
              </div>
            </div>

            {/* Seed Actions & CSV controllers */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">System maintenance toolbox</h4>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  id="figma-seed-btn"
                  onClick={handleLoadSampleData}
                  className="bg-slate-950 hover:bg-slate-900 active:scale-95 text-slate-400 hover:text-white font-bold text-[10px] py-2 px-3 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-all text-center uppercase tracking-wider"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Seed</span>
                </button>
                <button
                  id="figma-export-btn"
                  onClick={handleExportCSV}
                  className="bg-slate-950 hover:bg-slate-900 active:scale-95 text-slate-400 hover:text-white font-bold text-[10px] py-2 px-3 rounded-lg border border-slate-800 flex items-center justify-center gap-1.5 transition-all text-center uppercase tracking-wider"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Export</span>
                </button>
                <button
                  id="figma-purge-btn"
                  onClick={handleClearAllData}
                  className="bg-rose-950/20 hover:bg-rose-950/40 active:scale-95 text-rose-400 font-bold text-[10px] py-2 px-3 rounded-lg border border-rose-950/40 flex items-center justify-center gap-1.5 transition-all text-center uppercase tracking-wider"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Purge</span>
                </button>
              </div>
            </div>

          </section>

        </div>

      </div>
    </div>
  );
}
