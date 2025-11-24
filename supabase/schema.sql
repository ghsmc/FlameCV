-- Create the resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_name TEXT NOT NULL,
  file_data JSONB NOT NULL, -- Stores FileData: { base64, mimeType, name }
  analysis JSONB NOT NULL, -- Stores AnalysisData: { score, grade, summary, markdownContent, careerAdvice }
  user_id TEXT -- Optional: for future user authentication
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

-- Create index on user_id for faster filtering (if using user authentication)
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (you can restrict this later with authentication)
-- For public access (no authentication):
CREATE POLICY "Allow all operations" ON resumes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternative: If you want to restrict to authenticated users only, use:
-- CREATE POLICY "Users can manage their own resumes" ON resumes
--   FOR ALL
--   USING (auth.uid()::text = user_id)
--   WITH CHECK (auth.uid()::text = user_id);

