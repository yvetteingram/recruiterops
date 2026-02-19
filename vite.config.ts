import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load variables from the environment (e.g., Netlify or .env file)
  // Passing '' as the 3rd argument allows loading variables without the VITE_ prefix.
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Explicitly map keys, supporting both VITE_ prefixes and standard names
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || ''),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || env.VITE_SUPABASE_URL || ''),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''),
      'process.env.MAKE_WEBHOOK_SCREENING': JSON.stringify(env.MAKE_WEBHOOK_SCREENING || env.VITE_MAKE_WEBHOOK_SCREENING || ''),
      'process.env.MAKE_WEBHOOK_OUTREACH': JSON.stringify(env.MAKE_WEBHOOK_OUTREACH || env.VITE_MAKE_WEBHOOK_OUTREACH || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    server: {
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      emptyOutDir: true
    }
  };
});