import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { AnalysisData, UserPreferences, ThinkingProcess } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ============================================================
// THINKING SCHEMA - Structured reasoning before search
// ============================================================
const THINKING_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    resumeAnalysis: {
      type: Type.OBJECT,
      description: "Deep analysis of what the resume reveals about the candidate",
      properties: {
        title: { type: Type.STRING, description: "Section title (e.g., 'Resume Deep Dive')" },
        content: { type: Type.STRING, description: "2-3 paragraph analysis of the resume" },
        insights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3-5 key insights extracted (skills, patterns, strengths, areas to develop)"
        }
      },
      required: ["title", "content", "insights"]
    },
    preferencesAnalysis: {
      type: Type.OBJECT,
      description: "Analysis of what the user really wants (reading between the lines)",
      properties: {
        title: { type: Type.STRING, description: "Section title (e.g., 'What You Really Want')" },
        content: { type: Type.STRING, description: "2-3 paragraph interpretation of their preferences" },
        insights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3-5 insights about their motivations, risk tolerance, and priorities"
        }
      },
      required: ["title", "content", "insights"]
    },
    intersectionAnalysis: {
      type: Type.OBJECT,
      description: "The magic: where skills, interests, and opportunities overlap",
      properties: {
        title: { type: Type.STRING, description: "Section title (e.g., 'The Sweet Spot')" },
        content: { type: Type.STRING, description: "2-3 paragraph analysis of the intersection" },
        insights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "3-5 insights about ideal fit, gaps to address, and unique positioning"
        }
      },
      required: ["title", "content", "insights"]
    },
    searchStrategy: {
      type: Type.OBJECT,
      description: "The plan for finding matching companies",
      properties: {
        title: { type: Type.STRING, description: "Section title (e.g., 'Search Strategy')" },
        content: { type: Type.STRING, description: "Explanation of search approach" },
        insights: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Specific search queries or criteria to use"
        }
      },
      required: ["title", "content", "insights"]
    }
  },
  required: ["resumeAnalysis", "preferencesAnalysis", "intersectionAnalysis", "searchStrategy"]
};

// ============================================================
// MATCH SCHEMA - Final structured output for startup matching
// ============================================================
const MATCH_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "Startup-readiness score from 0 to 100." },
    grade: { type: Type.STRING, description: "A letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)." },
    summary: { type: Type.STRING, description: "A short 1-2 sentence summary of their startup fit." },
    markdownContent: { type: Type.STRING, description: "Brief 1-2 paragraph summary of their profile and positioning." },
    careerAdvice: {
      type: Type.OBJECT,
      description: "Detailed career matching and market assessment.",
      properties: {
        realityCheck: { type: Type.STRING, description: "Honest 2-3 sentence assessment of where they stand in the market. Address them as 'You'." },
        currentLevel: { type: Type.STRING, description: "Their assessed level (e.g., Intern, Junior, Mid-Level, Senior, Staff, Principal)." },
        estimatedSalary: { type: Type.STRING, description: "Estimated salary range for this profile (e.g., $80k - $100k)." },
        recommendedRoles: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of 3-4 specific job titles they should target at startups."
        },
        companyMatches: {
          type: Type.ARRAY,
          description: "12-15 real early-stage startup companies that match this profile, categorized by tier.",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Startup company name" },
              domain: { type: Type.STRING, description: "Company domain (e.g., example.com) for logo fetching" },
              tier: { type: Type.STRING, enum: ["Reach", "Target", "Safety"], description: "Reach = stretch goal, Target = good fit, Safety = likely to get" },
              reason: { type: Type.STRING, description: "Why this startup matches their profile specifically (2-3 sentences)" },
              description: { type: Type.STRING, description: "What the company does (1 sentence)" },
              location: { type: Type.STRING, description: "HQ Location (e.g., San Francisco, NYC, Remote)" },
              funding: { type: Type.STRING, description: "Funding stage (e.g., Pre-seed, Seed $3M, Series A $15M)" },
              employeeCount: { type: Type.STRING, description: "Approximate team size (e.g., '5-10', '20-50', '50-100')" },
              industry: { type: Type.STRING, description: "Primary industry/vertical (e.g., Fintech, Developer Tools, AI/ML, Healthcare)" },
              foundedYear: { type: Type.STRING, description: "Year the company was founded (e.g., '2023')" },
              techStack: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Key technologies used (e.g., ['React', 'Python', 'AWS']). Include 2-4 relevant technologies."
              },
              investors: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Notable investors or accelerators (e.g., ['Y Combinator', 'Sequoia']). Include 1-3 if known."
              },
              hiringRoles: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Specific roles they're likely hiring for that match the candidate (e.g., ['Senior Engineer', 'Founding Engineer']). Include 1-2 roles."
              },
              matchScore: { type: Type.NUMBER, description: "How well this company matches the candidate's profile (0-100)" },
            },
          },
        },
      },
      required: ["realityCheck", "currentLevel", "estimatedSalary", "recommendedRoles", "companyMatches"],
    }
  },
  required: ["score", "grade", "summary", "markdownContent", "careerAdvice"],
};

// ============================================================
// Callback type for streaming thinking updates
// ============================================================
export type ThinkingCallback = (phase: string, content: string) => void;

// Keep the old name as an alias for backwards compatibility
export const generateRoast = generateMatch;

export async function generateMatch(
  base64Data: string,
  mimeType: string,
  preferences?: UserPreferences | null,
  onThinkingUpdate?: ThinkingCallback
): Promise<AnalysisData> {
  try {
    let preferencesText = "No specific preferences provided - analyze based on resume alone.";
    
    if (preferences) {
      preferencesText = `
- Target Role: ${preferences.targetRole}
- Years of Experience: ${preferences.yearsOfExperience}
- Target Locations: ${preferences.targetLocations.join(', ')}
- Preferred Startup Stage: ${preferences.startupStage.join(', ')}
- Salary Expectation: ${preferences.salaryExpectation}
- Interested Domains: ${preferences.preferredDomains.join(', ')}`;
    }

    // ============================================================
    // PHASE 1: THINKING - Deep reasoning about the candidate
    // ============================================================
    onThinkingUpdate?.("thinking", "Analyzing your resume and preferences...");
    
    const thinkingResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: THINKING_SCHEMA,
        thinkingConfig: {
          thinkingBudget: 2048,
        },
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
            text: `Analyze this candidate step-by-step to find their perfect startup match.

USER PREFERENCES:
${preferencesText}

## Your Task: Reason Through This Carefully

### Step 1: Resume Deep Dive
Analyze the resume thoroughly:
- What hard skills do they actually have? (not just what they claim)
- What's their real experience level?
- What patterns do you see? (growth trajectory, industry focus, project types)
- What are their standout strengths?
- What story does this resume tell?

### Step 2: What They Really Want
Read between the lines of their preferences:
- Why did they choose these specific locations?
- What does their startup stage preference reveal about risk tolerance?
- Is their salary expectation realistic for their level?
- What domains interest them and why?
- What are they optimizing for? (learning, impact, money, lifestyle)

### Step 3: The Sweet Spot (Intersection Analysis)
Find where everything overlaps:
- Where do their skills meet their interests?
- What roles would they be GOOD at AND ENJOY?
- What's their unique positioning in the market?
- What type of company culture would they thrive in?
- What's their "unfair advantage" that startups would value?

### Step 4: Search Strategy
Plan the company search:
- What specific types of startups should we look for?
- What search queries will find the best matches?
- What criteria define Reach vs Target vs Safety for THIS person?
- What industries or verticals are the best fit?

Address the user directly as "You". Be insightful and constructive.`,
          },
        ],
      },
    });

    const thinkingText = thinkingResponse.text;
    if (!thinkingText) {
      throw new Error("No response from thinking phase.");
    }

    const thinking: ThinkingProcess = JSON.parse(thinkingText);
    console.log("Phase 1 complete - Thinking process captured");
    
    // Notify UI of thinking progress
    onThinkingUpdate?.("resume", thinking.resumeAnalysis.content);
    onThinkingUpdate?.("preferences", thinking.preferencesAnalysis.content);
    onThinkingUpdate?.("intersection", thinking.intersectionAnalysis.content);
    onThinkingUpdate?.("search", thinking.searchStrategy.content);

    // ============================================================
    // PHASE 2: SEARCH - Use thinking to find real companies
    // ============================================================
    onThinkingUpdate?.("searching", "Searching for matching startups...");

    const searchContext = `
CANDIDATE PROFILE (from analysis):
${thinking.resumeAnalysis.insights.map(i => `- ${i}`).join('\n')}

WHAT THEY WANT:
${thinking.preferencesAnalysis.insights.map(i => `- ${i}`).join('\n')}

THE SWEET SPOT:
${thinking.intersectionAnalysis.insights.map(i => `- ${i}`).join('\n')}

SEARCH STRATEGY:
${thinking.searchStrategy.insights.map(i => `- ${i}`).join('\n')}
`;

    const searchResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
      contents: {
        parts: [
          {
            text: `Based on this candidate analysis, find REAL early-stage startups that match their profile.

${searchContext}

USER PREFERENCES:
${preferencesText}

## Your Task

Use Google Search to find 12-15 REAL early-stage startups:

1. **Reach Companies (4-5)**: Series A startups - stretch goals but achievable
2. **Target Companies (4-5)**: Seed-stage startups - great mutual fit
3. **Safety Companies (4-5)**: Pre-seed/early startups - high likelihood of offer

REQUIREMENTS:
- Search for REAL, CURRENT companies using Google Search
- Match their domain interests and location preferences
- Include accurate: company domains, locations, funding info
- Explain WHY each company matches THIS specific person
- NO unicorns, NO big tech, NO established companies (avoid Stripe, Anthropic, etc.)

For each company provide:
- Name and domain
- What they do (1 sentence)
- Location and funding stage
- Specific reason they match this candidate`,
          },
        ],
      },
    });

    const searchText = searchResponse.text;
    if (!searchText) {
      throw new Error("No response from search phase.");
    }

    console.log("Phase 2 complete - Companies found");

    // ============================================================
    // PHASE 3: STRUCTURE - Combine thinking + search into final output
    // ============================================================
    onThinkingUpdate?.("structuring", "Preparing your matches...");

    const structuredResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: MATCH_SCHEMA,
      },
      contents: {
        parts: [
          {
            text: `Convert this analysis into the final JSON structure.

## THINKING ANALYSIS:
${JSON.stringify(thinking, null, 2)}

## COMPANY SEARCH RESULTS:
${searchText}

## INSTRUCTIONS:
- Score reflects startup-readiness (0-100)
- Summary should be memorable and specific to them (1-2 sentences)
- markdownContent: brief 1-2 paragraph summary of their positioning
- realityCheck: honest but constructive market assessment
- Extract ALL companies from search results (aim for 12-15 total)
- Ensure company domains are valid (e.g., "company.com")
- Address user as "You" throughout`,
          },
        ],
      },
    });

    const structuredText = structuredResponse.text;
    if (!structuredText) {
      throw new Error("No response from structuring phase.");
    }

    console.log("Phase 3 complete - Structured output ready");
    
    const result = JSON.parse(structuredText) as AnalysisData;
    
    // Attach the thinking process to the result
    result.thinking = thinking;
    
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
