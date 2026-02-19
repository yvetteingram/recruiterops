# RecruiterOps

AI Operations Agent for Recruiters. Add 1 extra placement per month without hiring a coordinator.

## 🚀 Deployment Instructions

### 1. Database Setup (Supabase)
Run this SQL in your project to create the ops tables:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company_name TEXT,
  role TEXT,
  plan TEXT DEFAULT 'starter',
  license_key TEXT,
  webhook_outreach TEXT,
  webhook_calendar TEXT
);

CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT,
  client TEXT,
  salary TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs ON DELETE CASCADE,
  name TEXT,
  title TEXT,
  company TEXT,
  linkedIn_url TEXT,
  stage TEXT DEFAULT 'Sourced',
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2. Environment Variables
Add these to your host (Netlify/Vercel):
- `API_KEY`: Gemini API Key
- `SUPABASE_URL`: Your Supabase Project URL
- `SUPABASE_ANON_KEY`: Your Supabase Anon Key

## 🤖 RecruiterOps Features
- **Stalled Detection**: Automatically flags inactive candidates and clients.
- **AI Scheduler**: Handles complex meeting coordination via Gemini.
- **Operation Nudges**: Drafts achievement-based follow-ups to move the pipeline.
- **Daily Briefings**: Actionable operations summaries every morning.