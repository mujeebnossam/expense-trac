import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Expense } from "../types";
import { Search, Calendar, FolderOpen, CreditCard, Sparkles, Filter, Trash2, Plus, X, ChevronRight, ChevronDown, Check, CircleAlert } from "lucide-react";

interface ExpenseLedgerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  onDeleteExpense: (id: string) => void;
}

export default function ExpenseLedger({ expenses, onAddExpense, onDeleteExpense }: ExpenseLedgerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Manual Form States
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  const categories = ["All", "Food", "Shopping", "Utilities", "Entertainment", "Health", "Travel", "Miscellaneous"];

  const getEmojiAndBg = (cat: string) => {
    switch (cat) {
      case "Food":
        return { emoji: "🍔", bg: "bg-emerald-500/10 text-emerald-400" };
      case "Shopping":
        return { emoji: "🛍️", bg: "bg-amber-500/10 text-amber-500" };
      case "Utilities":
        return { emoji: "💡", bg: "bg-cyan-500/10 text-cyan-500" };
      case "Entertainment":
        return { emoji: "🎬", bg: "bg-indigo-500/10 text-indigo-500" };
      case "Health":
        return { emoji: "❤️", bg: "bg-rose-500/10 text-rose-500" };
      case "Travel":
        return { emoji: "✈️", bg: "bg-orange-500/10 text-orange-500" };
      default:
        return { emoji: "📦", bg: "bg-slate-500/10 text-slate-400" };
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.merchant.toLowerCase().includes(search.toLowerCase()) || 
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim()) {
      setFormError("Merchant name is required");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid amount");
      return;
    }

    onAddExpense({
      merchant,
      date,
      category,
      amount: parsedAmount,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    // Reset Form
    setMerchant("");
    setAmount("");
    setCategory("Food");
    setDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("Credit Card");
    setNotes("");
    setFormError("");
    setIsAdding(false);
  };

  return (
    <div id="expense-ledger-container" className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col relative overflow-hidden h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Expense Ledger</h2>
          <p className="text-xs text-slate-400">Manage and audit your logged transactions</p>
        </div>
        <button
          id="toggle-manual-add-btn"
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl border border-indigo-500/30 flex items-center gap-1.5 transition-all"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {isAdding ? "Close Form" : "Add Manually"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.form
            id="manual-expense-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleFormSubmit}
            className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-4 mb-6 overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-300">New Transaction Entry</span>
              {formError && (
                <div className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                  <CircleAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Merchant</label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks Coffee"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                >
                  {categories.filter(c => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Payment Method</label>
                <input
                  type="text"
                  placeholder="e.g. Credit Card, Apple Pay"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Business lunch, coffee with team"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              id="submit-manual-expense-btn"
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all"
            >
              Add Expense Record
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters & Search Grid */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-expenses-input"
            type="text"
            placeholder="Search merchants or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 transition-all"
          />
        </div>

        {/* Small desktop scrollable categories list */}
        <div className="flex gap-1.5 overflow-x-auto max-w-full custom-scrollbar pb-1 shrink-0">
          {categories.slice(0, 5).map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all shrink-0 ${
                  active
                    ? "bg-slate-100 text-slate-950 border-slate-200"
                    : "bg-slate-950/30 text-slate-400 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
          {categories.length > 5 && (
            <select
              value={categories.includes(selectedCategory) && categories.indexOf(selectedCategory) >= 5 ? selectedCategory : "More"}
              onChange={(e) => {
                if (e.target.value !== "More") setSelectedCategory(e.target.value);
              }}
              className="text-[11px] px-2 py-1 rounded-lg border font-semibold bg-slate-950/30 text-slate-400 border-slate-800/80 focus:outline-none"
            >
              <option disabled value="More">More</option>
              {categories.slice(5).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Transactions list container */}
      <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[360px]">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-3xl bg-slate-950/10">
            <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-400">No transactions recorded</p>
            <p className="text-xs text-slate-500">Scan flat receipt layouts or write details manually</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredExpenses.map((expense) => {
              const { emoji, bg } = getEmojiAndBg(expense.category);
              const isExpanded = expandedId === expense.id;

              return (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-950/40 rounded-2xl border border-slate-800/80 overflow-hidden hover:border-slate-700/80 transition-all"
                >
                  {/* Ledger Row Head */}
                  <div
                    onClick={() => handleToggleExpand(expense.id)}
                    className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center text-lg`}>
                        {emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate max-w-[150px]">{expense.merchant}</p>
                          {expense.isAiGenerated && (
                            <span className="bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25 px-1.5 py-0.5 rounded text-[8.5px] uppercase flex items-center gap-0.5 tracking-wider font-mono">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">{expense.date} • {expense.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-white font-mono">-${expense.amount.toFixed(2)}</p>
                      <div className="text-slate-500 hover:text-white transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items & Notes Audit Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-300 space-y-3.5 pt-3.5"
                    >
                      {expense.notes && (
                        <div className="p-2.5 bg-slate-900 border border-slate-800/60 rounded-xl">
                          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Auditor Notes</span>
                          <span className="text-slate-300 mt-0.5 block">{expense.notes}</span>
                        </div>
                      )}

                      {expense.items && expense.items.length > 0 ? (
                        <div className="space-y-1.5 animate-slide-up">
                          <span className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider block">Scanned Line Items</span>
                          <div className="space-y-1">
                            {expense.items.map((item, id) => (
                              <div key={id} className="flex justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                                <span className="text-slate-300">
                                  {item.quantity ? `${item.quantity}x ` : ""}{item.name}
                                </span>
                                <span className="text-emerald-400 font-semibold">
                                  ${(item.price * (item.quantity ?? 1)).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic block">No secondary line item detail available.</div>
                      )}

                      <div className="flex justify-between items-center pt-2.5 border-t border-slate-900 text-[10px]">
                        <div className="text-slate-500 font-semibold uppercase">Category limits index: {expense.category}</div>
                        <button
                          id={`delete-btn-${expense.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteExpense(expense.id);
                          }}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 p-1.5 rounded-lg transition-all flex items-center gap-1 font-bold"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
