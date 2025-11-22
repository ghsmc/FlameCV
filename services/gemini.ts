import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

// Initialize the client
// process.env.API_KEY is guaranteed to be available by the runtime environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRoast = async (
  base64Data: string,
  mimeType: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7, // A bit of creativity for the roast
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
            text: "Roast my resume. Be brutal but helpful.",
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from the model.");
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateImprovement = async (
  base64Data: string,
  mimeType: string,
  previousRoast?: string
): Promise<string> => {
  try {
     // Construct the text prompt to include previous feedback if available for context
    let promptText = "FIX_MODE: Rewrite my resume based on your own suggestions. Here is the original resume:";
    if (previousRoast) {
        promptText = `FIX_MODE: Rewrite my resume based on your own suggestions and the following critique you provided:

${previousRoast}

Here is the original resume to rewrite:`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3, // Lower temperature for more professional output
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
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};