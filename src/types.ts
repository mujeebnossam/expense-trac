export interface ExpenseItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Expense {
  id: string;
  merchant: string;
  date: string;
  category: string;
  amount: number;
  tax?: number;
  paymentMethod: string;
  items?: ExpenseItem[];
  notes?: string;
  isAiGenerated?: boolean;
}

export interface CategoryBudget {
  category: string;
  limit: number;
  color: string;
}

export type ExpenseCategory = "Food" | "Shopping" | "Utilities" | "Entertainment" | "Health" | "Travel" | "Miscellaneous";
