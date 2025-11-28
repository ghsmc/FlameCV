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

// Storage bucket name
const RESUMES_BUCKET = 'resumes';

export interface ResumeRecord {
  id: string;
  created_at: string;
  file_name: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  file_data?: FileData; // DEPRECATED: Legacy support
  analysis: AnalysisData;
  user_id?: string;
}

// ============================================================
// STORAGE FUNCTIONS
// ============================================================

/**
 * Upload a resume file to Supabase Storage
 */
export const uploadResumeFile = async (
  file: File,
  userId: string,
  resumeId: string
): Promise<string | null> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/${resumeId}.${fileExt}`;

    console.log('Attempting storage upload:', { filePath, fileSize: file.size, fileType: file.type });

    const { data, error } = await supabase.storage
      .from(RESUMES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('Storage upload success:', data);

    // Get public URL (even for private buckets, this gives the URL path)
    const { data: { publicUrl } } = supabase.storage
      .from(RESUMES_BUCKET)
      .getPublicUrl(filePath);

    console.log('Generated file URL:', publicUrl);
    return publicUrl;
  } catch (err) {
    console.error('Exception during file upload:', err);
    return null;
  }
};

/**
 * Download a resume file from Supabase Storage
 */
export const downloadResumeFile = async (fileUrl: string): Promise<Blob | null> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return null;
  }

  try {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // userId/resumeId.ext

    const { data, error } = await supabase.storage
      .from(RESUMES_BUCKET)
      .download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error downloading file:', err);
    return null;
  }
};

/**
 * Delete a resume file from Supabase Storage
 */
export const deleteResumeFile = async (fileUrl: string): Promise<boolean> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return false;
  }

  try {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // userId/resumeId.ext

    const { error } = await supabase.storage
      .from(RESUMES_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error deleting file:', err);
    return false;
  }
};

/**
 * Save a resume and its analysis to the database
 * Now uses Supabase Storage instead of storing base64 in DB
 */
export const saveResume = async (
  file: FileData,
  analysis: AnalysisData,
  userId?: string,
  originalFile?: File
): Promise<HistoryItem | null> => {
  if (!supabase) {
    console.error('Supabase not initialized');
    return null;
  }

  try {
    // First, insert the record to get the ID
    const record: Partial<ResumeRecord> = {
      file_name: file.name,
      file_type: file.mimeType,
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
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Attempting to insert:', { userId, hasUserId: !!userId });
      return null;
    }

    // If originalFile and userId are provided, upload to storage
    if (originalFile && userId) {
      console.log('Uploading to storage:', { userId, resumeId: data.id, fileName: originalFile.name });
      const fileUrl = await uploadResumeFile(originalFile, userId, data.id);
      
      if (fileUrl) {
        console.log('Storage upload successful:', fileUrl);
        // Update record with file URL
        await supabase
          .from(RESUMES_TABLE)
          .update({ 
            file_url: fileUrl,
            file_size: originalFile.size 
          })
          .eq('id', data.id);
      } else {
        console.error('Storage upload failed, falling back to base64');
        // Fallback: Store base64 in DB
        await supabase
          .from(RESUMES_TABLE)
          .update({ file_data: file })
          .eq('id', data.id);
      }
    } else {
      console.log('No originalFile or userId, using legacy base64 storage');
      // Fallback: Store base64 in DB (legacy support)
      await supabase
        .from(RESUMES_TABLE)
        .update({ file_data: file })
        .eq('id', data.id);
    }

    return {
      id: data.id,
      timestamp: new Date(data.created_at).getTime(),
      fileName: data.file_name,
      analysis: data.analysis,
      resume: file,
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

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

export interface User {
  id: string;
  email: string;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Failed to create user account');
  }

  return {
    id: data.user.id,
    email: data.user.email || email,
  };
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Failed to sign in');
  }

  return {
    id: data.user.id,
    email: data.user.email || email,
  };
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) {
    console.warn('Supabase not initialized');
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
  };
};

/**
 * Listen for auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!supabase) {
    console.warn('Supabase not initialized');
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || '',
      });
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

