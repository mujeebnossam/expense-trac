import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Configure body parsing with size limits for receipt image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini integration will run in offline demo mode.");
}

// Receipt extraction response schema definitions
const receiptSchema = {
  type: Type.OBJECT,
  properties: {
    merchant: {
      type: Type.STRING,
      description: "Name of the merchant, store, restaurant, or service provider.",
    },
    date: {
      type: Type.STRING,
      description: "The calendar date of transaction as YYYY-MM-DD format. If year is missing or unclear, assume current year (2026). If date not found, use today's date.",
    },
    total: {
      type: Type.NUMBER,
      description: "Overall total amount paid inclusive of tax and tips.",
    },
    tax: {
      type: Type.NUMBER,
      description: "Tax amount, or 0 if none found.",
    },
    category: {
      type: Type.STRING,
      description: "Category of expense. Choose from: Food, Shopping, Utilities, Entertainment, Health, Travel, Miscellaneous.",
    },
    paymentMethod: {
      type: Type.STRING,
      description: "Payment method detected, e.g., Cash, Credit Card, Debit Card, Mobile Payment, or Unknown.",
    },
    items: {
      type: Type.ARRAY,
      description: "Line items detailed in the transaction, if available.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Friendly name of the item or product purchased.",
          },
          price: {
            type: Type.NUMBER,
            description: "Unit price of the item.",
          },
          quantity: {
            type: Type.INTEGER,
            description: "Number of units bought, defaulting to 1.",
          },
        },
        required: ["name", "price"],
      },
    },
  },
  required: ["merchant", "total", "category", "date"],
};

// API: Check AI status
app.get("/api/ai-status", (req, res) => {
  res.json({
    configured: !!ai,
    demoMode: !ai,
  });
});

// API: Scan Receipt Endpoint
app.post("/api/scan-receipt", async (req, res) => {
  try {
    const { base64Data, mimeType } = req.body;

    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: "Missing required properties: base64Data and mimeType." });
    }

    if (!ai) {
      // Offline fallback / Demo Mode with realistic randomized extraction Mock based on upload
      console.log("Gemini API not configured. Triggering demo simulator mode.");
      
      const fileTypeLabel = mimeType.split("/")[1]?.toUpperCase() || "IMAGE";
      const demoResponses = [
        {
          merchant: "Organic Meadows Foods",
          date: new Date().toISOString().split("T")[0],
          total: 42.85,
          tax: 3.40,
          category: "Food",
          paymentMethod: "Apple Pay (Debit)",
          items: [
            { name: "Almond Milk 1L", price: 4.50, quantity: 2 },
            { name: "Organic Strawberries 500g", price: 6.99, quantity: 1 },
            { name: "Sourdough Toast Artisan", price: 5.50, quantity: 1 },
            { name: "Avocado Prepack 4-in", price: 7.99, quantity: 1 },
            { name: "Premium Ground Espresso 250g", price: 13.37, quantity: 1 }
          ]
        },
        {
          merchant: "Shell Fueling Plaza",
          date: new Date().toISOString().split("T")[0],
          total: 68.20,
          tax: 5.12,
          category: "Travel",
          paymentMethod: "VISA Credit Card",
          items: [
            { name: "Super Unleaded Octane-95 (Litres)", price: 1.85, quantity: 32 },
            { name: "Windshield Cleanser Gel", price: 8.99, quantity: 1 }
          ]
        },
        {
          merchant: "Avenue Apparel & Co.",
          date: new Date().toISOString().split("T")[0],
          total: 124.50,
          tax: 11.20,
          category: "Shopping",
          paymentMethod: "Cash",
          items: [
            { name: "Tailored Linen Casual Shirt", price: 59.00, quantity: 1 },
            { name: "Comfy Knit Summer Socks", price: 12.50, quantity: 2 },
            { name: "Leather Minimalist Belt", price: 40.50, quantity: 1 }
          ]
        }
      ];

      // Pick one at random for fun demo experience
      const selectedDemo = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      
      // Simulate real-time scanning network delay (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json({ success: true, method: "SIMULATED_GEMINI", data: selectedDemo });
    }

    console.log("Analyzing file using Gemini API model: gemini-3.5-flash");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
        {
          text: "Carefully analyze the text in this receipt image. Extract all details requested in the schema. Make sure numeric prices match standard receipts and the math adds up. Categories MUST match Food, Shopping, Utilities, Entertainment, Health, Travel, Miscellaneous. Date MUST be format YYYY-MM-DD.",
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema,
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response received from Gemini AI model.");
    }

    try {
      const parsedData = JSON.parse(textOutput.trim());
      return res.json({ success: true, method: "GEMINI_AI", data: parsedData });
    } catch (parseError) {
      console.error("Failed to parse JSON string returned by Gemini:", textOutput);
      return res.status(500).json({ error: "Gemini returned invalid structured JSON output.", raw: textOutput });
    }

  } catch (error: any) {
    console.error("Receipt Scan API Error:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred during the receipt scan." });
  }
});

// Setup Vite & Static Assets Middleware
async function initializeApp() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is booting! Listening dynamically on http://localhost:${PORT}`);
  });
}

initializeApp().catch(err => {
  console.error("Fatal startup error in full-stack Express server:", err);
});
