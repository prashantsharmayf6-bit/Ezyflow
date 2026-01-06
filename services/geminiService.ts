
import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Create a new GoogleGenAI instance right before making an API call 
// to ensure it always uses the most up-to-date API key from the dialog.

export const generateWorkflowSuggestion = async (prompt: string) => {
  // Guideline: The API key must be obtained exclusively from process.env.API_KEY.
  // Guideline: Assume this variable is pre-configured, valid, and accessible.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    // Guideline: 'gemini-3-flash-preview' is used for basic text tasks.
    model: "gemini-3-flash-preview",
    contents: `Suggest a business workflow for: ${prompt}. Break it down into discrete steps.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            label: { type: Type.STRING, description: "Name of the step" },
            description: { type: Type.STRING, description: "Detailed description of what happens" },
            type: { type: Type.STRING, enum: ["action", "trigger", "condition"] }
          },
          required: ["id", "label", "description", "type"]
        }
      }
    }
  });

  try {
    // Guideline: response.text is a property, not a method.
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
};
