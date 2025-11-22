export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  FIXING = 'FIXING',
  FIX_COMPLETE = 'FIX_COMPLETE',
  ERROR = 'ERROR',
}

export interface TargetCompany {
  name: string;
  domain: string;
  reason: string;
}

export interface AnalysisData {
  score: number;
  grade: string;
  summary: string;
  markdownContent: string;
  targetCompanies?: TargetCompany[];
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface AnalysisError {
  message: string;
}