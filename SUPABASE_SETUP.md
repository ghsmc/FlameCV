# Supabase Setup Guide

This guide will help you set up Supabase to store resumes for FlameCV.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project

## Setup Steps

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: FlameCV (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project" and wait for it to be ready (~2 minutes)

### 2. Create the Database Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL
5. Verify the table was created by going to **Table Editor** and checking for the `resumes` table

### 3. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll need two values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

### 4. Configure Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist) and add:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
GEMINI_API_KEY=your_gemini_key_here
```

Replace:
- `your_project_url_here` with your Project URL from step 3
- `your_anon_key_here` with your anon public key from step 3
- `your_gemini_key_here` with your existing Gemini API key

### 5. Test the Setup

1. Start your development server: `npm run dev`
2. Upload a resume
3. Check your Supabase dashboard → **Table Editor** → `resumes` table to see if the data was saved

## Database Schema

The `resumes` table has the following structure:

- **id** (UUID): Primary key, auto-generated
- **created_at** (Timestamp): When the resume was uploaded
- **file_name** (Text): Original filename
- **file_data** (JSONB): The resume file data (base64, mimeType, name)
- **analysis** (JSONB): The analysis results (score, grade, summary, markdownContent, careerAdvice)
- **user_id** (Text, optional): For future user authentication

## Security Notes

The current setup uses a public policy that allows all operations. For production:

1. **Enable Authentication**: Set up Supabase Auth
2. **Update RLS Policies**: Modify the policy in `schema.sql` to restrict access to authenticated users
3. **Update the service**: Modify `services/supabase.ts` to pass user IDs when saving/fetching

## Troubleshooting

### "Supabase not initialized" warning
- Check that your `.env.local` file has the correct variable names (must start with `VITE_`)
- Restart your dev server after adding environment variables
- Verify the keys in your Supabase dashboard

### Data not saving
- Check the browser console for errors
- Verify your RLS policies allow the operations
- Check the Supabase dashboard → **Logs** for any errors

### Storage limits
- Supabase free tier includes 500MB database storage
- Each resume with base64 encoding can be several MB
- Consider implementing cleanup of old resumes if needed

## Alternative: Google Cloud Setup

If you prefer Google Cloud instead of Supabase:

1. Set up a Cloud SQL (PostgreSQL) instance
2. Create the same table schema
3. Use a backend API (Node.js/Express) to connect to the database
4. Update the service layer to call your API instead of Supabase directly

For Google Cloud, you'd need to:
- Create a Cloud SQL PostgreSQL instance
- Set up a backend API server
- Use the `pg` library to connect to PostgreSQL
- Update `services/supabase.ts` to call your API endpoints instead

