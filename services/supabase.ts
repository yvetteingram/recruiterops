import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  const isUrlValid = typeof supabaseUrl === 'string' && supabaseUrl.startsWith('https://');
  const isKeyValid = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 20;
  
  return isUrlValid && isKeyValid;
};

// Log configuration status on initialization
if (!isSupabaseConfigured()) {
  console.group("🛠️ RecruiterAgentAI: Database Setup Needed");
  if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
    console.warn("❌ SUPABASE_URL is missing or invalid. Format: https://your-id.supabase.co");
  }
  if (!supabaseAnonKey || supabaseAnonKey.length <= 20) {
    console.warn("❌ SUPABASE_ANON_KEY is missing or invalid.");
  }
  console.info("💡 To fix: Create a .env file locally OR add Environment Variables in Netlify.");
  console.groupEnd();
}

export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null as any;