-- Create the resumes table
-- Stores resume metadata and analysis results for Matchpoint users
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

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow all operations" ON resumes;
DROP POLICY IF EXISTS "Users can manage their own resumes" ON resumes;
DROP POLICY IF EXISTS "Anonymous users can insert resumes" ON resumes;

-- Policy 1: Authenticated users can manage their own resumes
CREATE POLICY "Authenticated users manage own resumes" ON resumes
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Policy 2: Anonymous users can insert and read their own resumes (for trial)
-- Allows INSERT with null/empty user_id AND allows reading those back
CREATE POLICY "Anonymous users can insert" ON resumes
  FOR INSERT
  WITH CHECK (auth.uid() IS NULL AND (user_id IS NULL OR user_id = ''));

CREATE POLICY "Anonymous users can read own" ON resumes
  FOR SELECT
  USING (auth.uid() IS NULL AND (user_id IS NULL OR user_id = ''));

