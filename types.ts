export enum AppState {
  IDLE = 'IDLE',
  SURVEY = 'SURVEY',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  FIXING = 'FIXING',
  FIX_COMPLETE = 'FIX_COMPLETE',
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