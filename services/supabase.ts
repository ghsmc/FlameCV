import { createClient } from '@supabase/supabase-js';
import { HistoryItem, FileData, AnalysisData } from '../types';

// Initialize Supabase client
// These will be set via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Database features will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database table name
const RESUMES_TABLE = 'resumes';

export interface ResumeRecord {
  id: string;
  created_at: string;
  file_name: string;
  file_data: FileData;
  analysis: AnalysisData;
  user_id?: string; // Optional: for future user authentication
}

/**
 * Save a resume and its analysis to the database
 */
export const saveResume = async (
  file: FileData,
  analysis: AnalysisData,
  userId?: string
): Promise<HistoryItem | null> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return null;
  }

  try {
    const record: Omit<ResumeRecord, 'id' | 'created_at'> = {
      file_name: file.name,
      file_data: file,
      analysis: analysis,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from(RESUMES_TABLE)
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error saving resume:', error);
      return null;
    }

    return {
      id: data.id,
      timestamp: new Date(data.created_at).getTime(),
      fileName: data.file_name,
      analysis: data.analysis,
      resume: data.file_data,
    };
  } catch (err) {
    console.error('Error saving resume:', err);
    return null;
  }
};

/**
 * Get all resumes for a user (or all if no userId)
 */
export const getResumes = async (userId?: string): Promise<HistoryItem[]> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return [];
  }

  try {
    let query = supabase
      .from(RESUMES_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); // Limit to last 50 resumes

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching resumes:', error);
      return [];
    }

    return (data || []).map((record: ResumeRecord) => ({
      id: record.id,
      timestamp: new Date(record.created_at).getTime(),
      fileName: record.file_name,
      analysis: record.analysis,
      resume: record.file_data,
    }));
  } catch (err) {
    console.error('Error fetching resumes:', err);
    return [];
  }
};

/**
 * Get a single resume by ID
 */
export const getResumeById = async (id: string): Promise<HistoryItem | null> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from(RESUMES_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching resume:', error);
      return null;
    }

    return {
      id: data.id,
      timestamp: new Date(data.created_at).getTime(),
      fileName: data.file_name,
      analysis: data.analysis,
      resume: data.file_data,
    };
  } catch (err) {
    console.error('Error fetching resume:', err);
    return null;
  }
};

/**
 * Delete a resume by ID
 */
export const deleteResume = async (id: string): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return false;
  }

  try {
    const { error } = await supabase
      .from(RESUMES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting resume:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error deleting resume:', err);
    return false;
  }
};

/**
 * Clear all resumes for a user (or all if no userId)
 */
export const clearAllResumes = async (userId?: string): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return false;
  }

  try {
    let query = supabase.from(RESUMES_TABLE).delete();

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error clearing resumes:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error clearing resumes:', err);
    return false;
  }
};

/**
 * Get total count of resumes
 */
export const getResumeCount = async (userId?: string): Promise<number> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return 0;
  }

  try {
    let query = supabase
      .from(RESUMES_TABLE)
      .select('id', { count: 'exact', head: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting resumes:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Error counting resumes:', err);
    return 0;
  }
};

