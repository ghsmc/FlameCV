export enum AppState {
  IDLE = 'IDLE',
  SURVEY = 'SURVEY',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export interface UserPreferences {
  targetRole: string;
  targetLocations: string[];
  startupStage: string[];
  preferredDomains: string[];
  yearsOfExperience: string;
  salaryExpectation: string;
}

export interface CompanyMatch {
  name: string;
  domain: string;
  tier: 'Reach' | 'Target' | 'Safety';
  reason: string;
  description?: string;
  location?: string;
  funding?: string;
  // Enhanced fields
  employeeCount?: string;       // e.g., "10-25", "50-100"
  industry?: string;            // e.g., "Fintech", "Developer Tools"
  foundedYear?: string;         // e.g., "2023"
  techStack?: string[];         // e.g., ["React", "Python", "AWS"]
  investors?: string[];         // e.g., ["Y Combinator", "a16z"]
  hiringRoles?: string[];       // e.g., ["Senior Engineer", "Product Manager"]
  linkedinUrl?: string;         // Direct company LinkedIn URL
  matchScore?: number;          // 0-100 match percentage
}

export interface ReasoningStep {
  title: string;
  content: string;
  insights: string[];
}

export interface ThinkingProcess {
  resumeAnalysis: ReasoningStep;
  preferencesAnalysis: ReasoningStep;
  intersectionAnalysis: ReasoningStep;
  searchStrategy: ReasoningStep;
}

export interface CareerAdvice {
  currentLevel: string;
  estimatedSalary: string;
  recommendedRoles: string[];
  realityCheck: string;
  companyMatches: CompanyMatch[];
}

export interface AnalysisData {
  score: number;
  grade: string;
  summary: string;
  markdownContent: string;
  careerAdvice?: CareerAdvice;
  thinking?: ThinkingProcess;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface AnalysisError {
  message: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  analysis: AnalysisData;
  resume: FileData; // Store the resume file data
}