import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (
  prompt: string,
  history: { role: string; text: string }[]
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Convert history to format expected by Chat if using chat interface, 
    // or just append to prompt for single generation context.
    // Here we use a simple generateContent with system instruction context.
    
    const systemInstruction = `You are Suncube AI, an advanced energy assistant for a solar power dashboard. 
    Keep answers concise, professional, and data-driven. 
    You have access to the following hypothetical real-time context:
    - Current Output: 42.5 kW
    - Daily Efficiency: 98%
    - Weather: Sunny, 28°C
    - No critical system faults.
    
    User question: ${prompt}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: systemInstruction,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Flash model usually doesn't need high thinking budget for simple queries
      }
    });

    return response.text || "I'm having trouble connecting to the solar grid network right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System offline. Please check connection.";
  }
};
