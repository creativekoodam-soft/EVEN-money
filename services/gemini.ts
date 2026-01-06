
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from "../types";

// Always use named parameter for apiKey and obtain it directly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseTransaction = async (text: string): Promise<Partial<Transaction> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Parse this financial entry: "${text}". Extract details into JSON. Today's date is ${new Date().toLocaleDateString()}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING, description: "Suggest a category from: Food & Dining, Transport, Shopping, Housing, Utilities, Entertainment, Health, Salary, Investment, Gift, Other" },
            type: { type: Type.STRING, description: "Must be 'income' or 'expense'" },
            description: { type: Type.STRING },
            date: { type: Type.STRING, description: "ISO format date" }
          },
          required: ["amount", "type", "category"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      amount: result.amount,
      category: result.category,
      type: result.type as TransactionType,
      description: result.description || text,
      date: result.date || new Date().toISOString(),
      isConfirmed: false
    };
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};

export const getAIInsights = async (transactions: Transaction[]): Promise<string> => {
  try {
    const summary = transactions.map(t => `${t.date}: ${t.type} of ${t.amount} in ${t.category}`).join('\n');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on these transactions, provide 3 short, punchy financial insights or tips. Focus on trends and savings: \n${summary}`,
    });
    return response.text || "Keep tracking to get personalized insights!";
  } catch (error) {
    return "Analyzing your spending patterns...";
  }
};
