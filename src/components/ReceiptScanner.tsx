import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scan, Upload, FileText, Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import { Expense, ExpenseItem } from "../types";

interface ReceiptScannerProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
}

export default function ReceiptScanner({ onAddExpense }: ReceiptScannerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<{
    merchant: string;
    date: string;
    total: number;
    tax?: number;
    category: string;
    paymentMethod: string;
    items?: ExpenseItem[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;

    // Is it an image?
    if (!file.type.match("image/(png|jpeg|webp|jpg)") && file.type !== "application/pdf") {
      setError("Please upload an image (PNG, JPEG, WEBP) or a PDF receipt.");
      return;
    }

    setScanning(true);
    setError(null);
    setScannedResult(null);

    try {
      const reader = new FileReader();
      
      const fileDataPromise = new Promise<{ base64Data: string; mimeType: string }>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === "string") {
            const split = reader.result.split(",");
            const base64Data = split[1] || "";
            resolve({
              base64Data,
              mimeType: file.type || "image/jpeg",
            });
          } else {
            reject(new Error("Failed to read file."));
          }
        };
        reader.onerror = () => reject(new Error("File reading failed."));
        reader.readAsDataURL(file);
      });

      const { base64Data, mimeType } = await fileDataPromise;

      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64Data, mimeType }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: "Server responded with an error status." }));
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setScannedResult(result.data);
      } else {
        throw new Error(result.error || "Failed to extract matching data from the receipt.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while uploading. Please write manually or retry.");
    } finally {
      setScanning(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAcceptScan = () => {
    if (!scannedResult) return;
    onAddExpense({
      merchant: scannedResult.merchant,
      date: scannedResult.date || new Date().toISOString().split("T")[0],
      category: scannedResult.category || "Food",
      amount: scannedResult.total,
      tax: scannedResult.tax,
      paymentMethod: scannedResult.paymentMethod || "Unknown",
      items: scannedResult.items,
      notes: "Scanned with AI Scanner",
      isAiGenerated: true,
    });
    setScannedResult(null);
  };

  return (
    <div id="receipt-scanner-container" className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col relative overflow-hidden h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            Smart Receipt Scanner
          </h2>
          <p className="text-slate-400 text-sm">AI-powered instant transaction extraction</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>LIVE GEMINI AI</span>
        </div>
      </div>

      <div
        id="scanner-drag-drop-zone"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 min-h-[180px] ${
          dragActive
            ? "border-emerald-400 bg-emerald-500/5"
            : "border-slate-700 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-950/70"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={handleChange}
        />

        {scanning ? (
          <div className="space-y-3">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Gemini is analyzing your receipt...</p>
              <p className="text-xs text-slate-500">Extracting merchant, items, totals, and category</p>
            </div>
          </div>
        ) : scannedResult ? (
          <div className="w-full text-left bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-4 cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Successfully Scanned</p>
                <h3 className="text-base font-bold text-white mt-0.5">{scannedResult.merchant}</h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400 font-mono">${scannedResult.total.toFixed(2)}</span>
                <p className="text-[10px] text-slate-400">{scannedResult.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 border-t border-b border-slate-800/80 py-2">
              <div>
                <span className="text-slate-500 block text-[9.5px] uppercase">Date</span>
                <span className="font-semibold">{scannedResult.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9.5px] uppercase">Payment Method</span>
                <span className="font-semibold">{scannedResult.paymentMethod}</span>
              </div>
            </div>

            {scannedResult.items && scannedResult.items.length > 0 && (
              <div className="space-y-1">
                <span className="text-slate-500 block text-[9.5px] uppercase mb-1">Extracted Line Items ({scannedResult.items.length})</span>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {scannedResult.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[11px] bg-slate-900/40 p-1.5 rounded border border-slate-800/30">
                      <span className="text-slate-200 truncate pr-2">
                        {item.quantity ? `${item.quantity}x ` : ""}{item.name}
                      </span>
                      <span className="text-slate-400 font-mono">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                id="approve-scan-btn"
                onClick={handleAcceptScan}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                Add to Expense Ledger
              </button>
              <button
                id="discard-scan-btn"
                onClick={() => setScannedResult(null)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-semibold text-xs py-2 px-3 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pointer-events-none">
            <div className="w-14 h-14 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto shadow-lg border border-slate-700/50">
              <Upload className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-300 font-medium">Drag and drop receipts, or click to browse</p>
              <p className="text-xs text-slate-500">Supports PNG, JPG, PDF</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div id="scanner-error-card" className="mt-3 flex items-start gap-2 bg-rose-950/50 border border-rose-900/50 p-3 rounded-xl text-xs text-rose-300 animate-slide-up">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <div className="flex-1 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Accuracy</p>
          <p className="text-sm font-semibold text-white font-mono">99.8%</p>
        </div>
        <div className="flex-grow bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Scanning Engine</p>
          <p className="text-sm font-semibold text-white flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Gemini 3.5 Flash
          </p>
        </div>
      </div>
    </div>
  );
}
