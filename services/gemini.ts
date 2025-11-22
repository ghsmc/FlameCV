import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { AnalysisData } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ROAST_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "A score from 0 to 100 based on resume quality." },
    grade: { type: Type.STRING, description: "A letter grade (A, B, C, D, F)." },
    summary: { type: Type.STRING, description: "A short 1-2 sentence summary of the verdict." },
    markdownContent: { type: Type.STRING, description: "The full markdown text of the roast or critique." },
    targetCompanies: {
      type: Type.ARRAY,
      description: "A list of 3-4 real tech companies that would fit this candidate profile.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Company name" },
          domain: { type: Type.STRING, description: "Company domain name (e.g., stripe.com) for logo fetching" },
          reason: { type: Type.STRING, description: "Why this is a good match" },
        },
      },
    },
  },
  required: ["score", "grade", "summary", "markdownContent", "targetCompanies"],
};

const FIX_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "The new improved score from 0 to 100." },
    grade: { type: Type.STRING, description: "The new improved letter grade." },
    summary: { type: Type.STRING, description: "A short summary of the improvements made." },
    markdownContent: { type: Type.STRING, description: "The fully rewritten resume in markdown format." },
  },
  required: ["score", "grade", "summary", "markdownContent"],
};

export const generateRoast = async (
  base64Data: string,
  mimeType: string
): Promise<AnalysisData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: ROAST_SCHEMA,
      },
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Analyze this resume. Provide a brutal roast, a score, a grade, and suggested target companies. Follow the JSON schema.",
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from the model.");
    }
    return JSON.parse(text) as AnalysisData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateImprovement = async (
  base64Data: string,
  mimeType: string,
  previousRoast?: string
): Promise<AnalysisData> => {
  try {
    let promptText = "FIX_MODE: Rewrite this resume to maximize the score. Output JSON.";
    if (previousRoast) {
        promptText = `FIX_MODE: Rewrite my resume based on your own suggestions and the following critique you provided:

${previousRoast}

Here is the original resume to rewrite. Output JSON with the new score and the rewritten markdown.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3, 
        responseMimeType: "application/json",
        responseSchema: FIX_SCHEMA,
      },
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from the model.");
    }
    return JSON.parse(text) as AnalysisData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};