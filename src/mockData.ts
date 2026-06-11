import { Expense, CategoryBudget } from "./types";

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: "Food", limit: 600, color: "bg-emerald-500 text-emerald-500 stroke-emerald-500 fill-emerald-500 border-emerald-500" },
  { category: "Shopping", limit: 400, color: "bg-amber-500 text-amber-500 stroke-amber-500 fill-amber-500 border-amber-500" },
  { category: "Utilities", limit: 300, color: "bg-cyan-500 text-cyan-500 stroke-cyan-500 fill-cyan-500 border-cyan-500" },
  { category: "Entertainment", limit: 250, color: "bg-indigo-500 text-indigo-500 stroke-indigo-500 fill-indigo-500 border-indigo-500" },
  { category: "Health", limit: 150, color: "bg-rose-500 text-rose-500 stroke-rose-500 fill-rose-500 border-rose-500" },
  { category: "Travel", limit: 500, color: "bg-orange-500 text-orange-500 stroke-orange-500 fill-orange-500 border-orange-500" },
  { category: "Miscellaneous", limit: 100, color: "bg-slate-400 text-slate-400 stroke-slate-400 fill-slate-400 border-slate-400" },
];

export const INITIAL_EXPENSES = (): Expense[] => {
  const now = new Date();
  
  const getPastDate = (daysAgo: number): string => {
    const d = new Date();
    d.setDate(now.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  return [
    {
      id: "exp-1",
      merchant: "Organic Meadows Foods",
      date: getPastDate(1),
      category: "Food",
      amount: 42.85,
      tax: 3.40,
      paymentMethod: "Apple Pay (Debit)",
      items: [
        { name: "Almond Milk 1L", price: 4.50, quantity: 2 },
        { name: "Organic Strawberries 500g", price: 6.99, quantity: 1 },
        { name: "Sourdough Toast Artisan", price: 5.50, quantity: 1 },
        { name: "Avocado Prepack 4-in", price: 7.99, quantity: 1 },
        { name: "Premium Ground Espresso 250g", price: 13.37, quantity: 1 }
      ],
      notes: "Weekly organic farm grocery delivery series",
    },
    {
      id: "exp-2",
      merchant: "Shell Fueling Plaza",
      date: getPastDate(3),
      category: "Travel",
      amount: 68.20,
      tax: 5.12,
      paymentMethod: "VISA Credit Card",
      items: [
        { name: "Super Unleaded Octane-95 (Litres)", price: 1.85, quantity: 32 },
        { name: "Windshield Cleanser Gel", price: 8.99, quantity: 1 }
      ],
      notes: "Highway standard gas fill",
    },
    {
      id: "exp-3",
      merchant: "Netflix Streaming Premium",
      date: getPastDate(5),
      category: "Entertainment",
      amount: 22.99,
      paymentMethod: "Autopay Card",
      notes: "4K ultra monthly streaming subscription",
    },
    {
      id: "exp-4",
      merchant: "Apple Store Infinite Loop",
      date: getPastDate(8),
      category: "Shopping",
      amount: 24.50,
      tax: 1.96,
      paymentMethod: "Mastercard Credit",
      items: [
        { name: "USB-C to 3.5 mm Headphone Adapter", price: 9.00, quantity: 1 },
        { name: "Silicone Charging Cable (1m)", price: 15.50, quantity: 1 }
      ],
      notes: "Replacement accessories",
    },
    {
      id: "exp-5",
      merchant: "Walgreens Pharmacy Hub",
      date: getPastDate(12),
      category: "Health",
      amount: 45.00,
      paymentMethod: "Amex Credit",
      notes: "Prescriptions and daily vitamins",
    },
    {
      id: "exp-6",
      merchant: "Clean Energy Electric Bill",
      date: getPastDate(15),
      category: "Utilities",
      amount: 145.10,
      paymentMethod: "Direct Bank Transfer",
      notes: "Central AC cooling consumption cycle bill",
    }
  ];
};
