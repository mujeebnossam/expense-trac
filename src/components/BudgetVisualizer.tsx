import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Expense, CategoryBudget } from "../types";
import { PiggyBank, Edit3, Check, X, ShieldAlert, BarChart3, TrendingUp } from "lucide-react";

interface BudgetVisualizerProps {
  expenses: Expense[];
  budgets: CategoryBudget[];
  onUpdateBudget: (category: string, newLimit: number) => void;
}

export default function BudgetVisualizer({ expenses, budgets, onUpdateBudget }: BudgetVisualizerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudgets, setEditedBudgets] = useState<{ [category: string]: string }>({});

  // Calc total spending
  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpentPercent = totalLimit > 0 ? Math.min(100, (totalSpending / totalLimit) * 100) : 0;

  // Group expense totals by category
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as { [cat: string]: number });

  // Handle opening editor
  const handleStartEdit = () => {
    const initialVals: { [category: string]: string } = {};
    budgets.forEach((b) => {
      initialVals[b.category] = b.limit.toString();
    });
    setEditedBudgets(initialVals);
    setIsEditing(true);
  };

  const handleSaveBudgets = () => {
    Object.entries(editedBudgets).forEach(([category, limitStr]) => {
      const parsed = parseFloat(limitStr as string);
      if (!isNaN(parsed) && parsed >= 0) {
        onUpdateBudget(category, parsed);
      }
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleChangeeditedValue = (category: string, val: string) => {
    setEditedBudgets((prev) => ({ ...prev, [category]: val }));
  };

  const categorySpendingList = budgets.map((b) => {
    const spent = categoryTotals[b.category] || 0;
    const percent = b.limit > 0 ? Math.min(100, (spent / b.limit) * 100) : 0;
    const isOver = spent > b.limit;

    return {
      category: b.category,
      limit: b.limit,
      spent,
      percent,
      isOver,
      color: b.color,
    };
  });

  return (
    <div id="budget-visualizer-container" className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <PiggyBank className="w-5 h-5 flex-shrink-0" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-[15px] md:text-base text-white tracking-wide">Budget Overview</h2>
            <p className="text-xs text-slate-500">Track and limit monthly outflows</p>
          </div>
        </div>
        {!isEditing ? (
          <button
            id="edit-budgets-btn"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800/80 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Set Limits
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              id="save-budgets-btn"
              onClick={handleSaveBudgets}
              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all"
              title="Save changes"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              id="cancel-budgets-btn"
              onClick={handleCancelEdit}
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* SVG Circular Ring Chart (Budget spent % metric in gorgeous dark style) */}
      <div className="relative flex flex-col items-center py-6 bg-slate-950/40 rounded-2xl border border-slate-800/80">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle outline */}
            <circle
              cx="72"
              cy="72"
              r="58"
              className="stroke-slate-800 fill-none"
              strokeWidth="10"
            />
            {/* Animated consumption gradient ring */}
            <motion.circle
              cx="72"
              cy="72"
              r="58"
              className="stroke-emerald-400 fill-none"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 58}
              animate={{
                strokeDashoffset: 2 * Math.PI * 58 * (1 - totalSpentPercent / 100),
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Floating Percentage Details inside the wheel */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black tracking-tight text-white leading-none">
              {totalSpentPercent.toFixed(0)}%
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mt-1">
              Spent
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-0.5 px-6 text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Consumed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white leading-none font-mono">
              ${totalSpending.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold font-mono text-slate-500">
              / ${totalLimit.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Categories Spend Limits Overview */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider px-1">
          <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
          <span>Category Breakdown</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence mode="popLayout">
            {categorySpendingList.map((entry) => {
              const spentColorClass = entry.isOver
                ? "bg-rose-500"
                : entry.color.split(" ")[0]; // dynamic bg class

              const pillColorWord = entry.color.split(" ").find(c => c.includes("text-")) || "text-emerald-400";
              const borderClass = entry.color.split(" ").find(c => c.includes("border-")) || "border-emerald-500";
              
              const pillLabelColor = entry.isOver
                ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                : `${pillColorWord} bg-slate-900 ${borderClass}/20` ;

              return (
                <motion.div
                  key={entry.category}
                  layout
                  className="bg-slate-950/40 rounded-2xl p-3.5 border border-slate-800/60 flex flex-col gap-2.5 hover:bg-slate-950/70 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${pillLabelColor}`}>
                        {entry.category}
                      </span>
                      {entry.isOver && (
                        <span className="text-rose-400 animate-pulse" title="Budget Exceeded!">
                          <ShieldAlert className="w-4.5 h-4.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-white font-mono">
                        ${entry.spent.toFixed(2)}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px] uppercase">
                        of
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-850 rounded-lg px-2 py-0.5 w-20">
                          <span className="text-slate-500 text-[10px] font-semibold">$</span>
                          <input
                            type="text"
                            className="bg-transparent border-none text-white font-bold font-mono focus:outline-none w-full text-xs"
                            value={editedBudgets[entry.category] || "0"}
                            onChange={(e) => handleChangeeditedValue(entry.category, e.target.value)}
                          />
                        </div>
                      ) : (
                        <span className="font-bold font-mono text-slate-400 text-xs">
                          ${entry.limit.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progressive Horizontal Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${entry.percent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${spentColorClass}`}
                    />
                  </div>

                  {/* Percentage Metric line */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="font-semibold">{entry.percent.toFixed(0)}% consumed</span>
                    {entry.isOver ? (
                      <span className="text-rose-400 font-bold">
                        Exceeded by ${(entry.spent - entry.limit).toFixed(2)}
                      </span>
                    ) : (
                      <span className="font-medium text-slate-400">${(entry.limit - entry.spent).toFixed(2)} left</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
