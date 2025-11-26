import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { AnalysisData, UserPreferences } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean and parse JSON from mixed content responses
function cleanAndParseJson(text: string): any {
  // Remove markdown code block markers
  let cleanText = text.replace(/```json\s*/g, '').replace(/```/g, '');
  
  // Find the first '{' and the last '}' to handle any conversational text
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleanText = cleanText.substring(firstBrace, lastBrace + 1);
  }
  
  return JSON.parse(cleanText);
}

const ROAST_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "A score from 0 to 100 based on resume quality." },
    grade: { type: Type.STRING, description: "A letter grade (A, B, C, D, F)." },
    summary: { type: Type.STRING, description: "A short 1-2 sentence summary of the verdict." },
    markdownContent: { type: Type.STRING, description: "The full markdown text of the roast or critique." },
    careerAdvice: {
      type: Type.OBJECT,
      description: "Detailed career matching and reality check.",
      properties: {
        realityCheck: { type: Type.STRING, description: "A brutal, 2-3 sentence assessment of the user's actual market value and level. Address them directly as 'You'." },
        currentLevel: { type: Type.STRING, description: "Their assessed level (e.g., Junior, Mid-Level, Senior, Staff)." },
        estimatedSalary: { type: Type.STRING, description: "Estimated salary range for this profile (e.g., $80k - $100k)." },
        recommendedRoles: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of 3-4 specific job titles they should target."
        },
        companyMatches: {
          type: Type.ARRAY,
          description: "A list of real EARLY-STAGE STARTUP companies that fit this profile, categorized by tier. Use web access to find current, real early-stage startups. Avoid well-known companies, unicorns, or established startups.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Early-stage startup company name" },
              domain: { type: Type.STRING, description: "Company domain name (e.g., example.com) for logo fetching" },
              tier: { type: Type.STRING, enum: ["Reach", "Target", "Safety"], description: "Match category (Reach = Series A startups 10-50 employees, Target = Seed-stage 5-20 employees, Safety = Pre-seed 2-10 employees)." },
              reason: { type: Type.STRING, description: "Why this early-stage startup is a match" },
              description: { type: Type.STRING, description: "Short description of what the company does (1 sentence)." },
              location: { type: Type.STRING, description: "HQ Location (e.g. San Francisco, Remote)." },
              funding: { type: Type.STRING, description: "Funding stage or recent round (e.g. Series A, $15M)." },
            },
          },
        },
      },
      required: ["realityCheck", "currentLevel", "estimatedSalary", "recommendedRoles", "companyMatches"],
    }
  },
  required: ["score", "grade", "summary", "markdownContent", "careerAdvice"],
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
  mimeType: string,
  preferences?: UserPreferences | null
): Promise<AnalysisData> => {
  try {
    let userContext = "";
    if (preferences) {
      userContext = `
USER PREFERENCES:
- Target Role: ${preferences.targetRole}
- Years of Experience: ${preferences.yearsOfExperience}
- Target Locations (Hubs): ${preferences.targetLocations.join(', ')}
- Preferred Startup Stage: ${preferences.startupStage.join(', ')}
- Salary Expectation: ${preferences.salaryExpectation}
- Interested Domains: ${preferences.preferredDomains.join(', ')}

INSTRUCTION: Tailor the "Career Reality Check", "Recommended Roles", and "Company Matches" specifically to these preferences.
- If they want "Seed/Chaos", find actual seed-stage companies in their preferred location.
- If they want "Series B/Scaling", find growing startups.
- If their location is specific (e.g. "SF"), prioritize companies in that hub.
- Use their Salary Expectation to calibrate the "Estimated Salary" and level assessment.
- If their resume doesn't match their target role/level, roast them for the gap.
`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        // Note: Cannot use responseMimeType with tools, so we'll ask for JSON in the prompt
        tools: [{ googleSearch: {} }],
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
            text: `Analyze this resume. Provide a brutal roast, score, and a detailed career reality check matching the user to EARLY-STAGE STARTUP companies (use web access via google_search tool to find real, current early-stage startups), roles, and levels. 
${userContext}
CRITICAL: Focus on EARLY-STAGE startups only (seed, pre-seed, Series A). Avoid well-known companies, unicorns, or established startups like Databricks, Anthropic, Ramp, Stripe, etc. Look for companies that are:
- Seed-stage: 5-20 employees, raised seed funding, actively hiring
- Pre-seed: 2-10 employees, just starting out
- Series A: 10-50 employees, recently raised Series A

IMPORTANT: Address the user directly as "You". Do not use third person.

IMPORTANT: You must output your response as valid JSON matching this exact schema. Provide AT LEAST 3-5 distinct startup matches for EACH tier (Reach, Target, Safety):
{
  "score": <number 0-100>,
  "grade": "<letter grade>",
  "summary": "<1-2 sentence summary>",
  "markdownContent": "<full markdown text>",
  "careerAdvice": {
    "realityCheck": "<2-3 sentence assessment>",
    "currentLevel": "<level>",
    "estimatedSalary": "<salary range>",
    "recommendedRoles": ["<role1>", "<role2>", "<role3>"],
    "companyMatches": [
      {
        "name": "<startup name>",
        "domain": "<domain.com>",
        "tier": "<Reach|Target|Safety>",
        "reason": "<why this matches>",
        "description": "<what they do>",
        "location": "<city/remote>",
        "funding": "<series/amount>"
      },
      { ... more matches ... }
    ]
  }
}

Use the google_search tool to find real, current EARLY-STAGE startup companies (seed, pre-seed, Series A) before providing your response. Avoid well-known companies, unicorns, or established startups.`,
          },
        ],
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from the model.");
    }
    
    try {
      return cleanAndParseJson(text) as AnalysisData;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("Failed to parse analysis results. Please try again.");
    }
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
    let promptText = `FIX_MODE: Rewrite this resume to maximize the score. 

IMPORTANT: Output your response as valid JSON matching this exact schema:
{
  "score": <number 0-100>,
  "grade": "<letter grade>",
  "summary": "<summary of improvements>",
  "markdownContent": "<fully rewritten resume in markdown>"
}`;
    
    if (previousRoast) {
        promptText = `FIX_MODE: Rewrite my resume based on your own suggestions and the following critique you provided:

${previousRoast}

Here is the original resume to rewrite. 

IMPORTANT: Output your response as valid JSON matching this exact schema:
{
  "score": <number 0-100>,
  "grade": "<letter grade>",
  "summary": "<summary of improvements>",
  "markdownContent": "<fully rewritten resume in markdown>"
}`;
    }

    // For FIX_MODE, we don't need web access, so we can use JSON mode
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3, 
        responseMimeType: "application/json",
        responseSchema: FIX_SCHEMA,
        // No tools needed for fix mode
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