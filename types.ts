export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  FIXING = 'FIXING',
  FIX_COMPLETE = 'FIX_COMPLETE',
  ERROR = 'ERROR',
}

export interface RoastResult {
  markdown: string;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface AnalysisError {
  message: string;
}