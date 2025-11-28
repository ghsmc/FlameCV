-- Create the resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_name TEXT NOT NULL,
  file_url TEXT, -- Storage URL for the resume file
  file_type TEXT, -- MIME type (application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document)
  file_size INTEGER, -- File size in bytes
  file_data JSONB, -- DEPRECATED: Legacy base64 storage (to be removed)
  analysis JSONB NOT NULL, -- Stores AnalysisData: { score, grade, summary, markdownContent, careerAdvice }
  user_id TEXT -- Required: auth.uid() of the owner
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

-- Create index on user_id for faster filtering (if using user authentication)
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Drop old policy if it exists
DROP POLICY IF EXISTS "Allow all operations" ON resumes;

-- Policy: Users can only manage their own resumes
-- Authenticated users can read and write their own resumes
CREATE POLICY "Users can manage their own resumes" ON resumes
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Allow anonymous users to insert resumes (for testing/onboarding)
-- This allows users to try the app before signing up
-- You can remove this policy if you want to require authentication
CREATE POLICY "Anonymous users can insert resumes" ON resumes
  FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = '');

