// Environment configuration for the application
// Vite exposes env vars as import.meta.env.VITE_*

// Determine API URL based on environment
export const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Application URL
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;

// Azure OpenAI configuration
export const AZURE_ENDPOINT = import.meta.env.VITE_AZURE_ENDPOINT || '';
export const AZURE_API_KEY = import.meta.env.VITE_AZURE_API_KEY || '';

// Validate required environment variables
const requiredEnvVars = {
  VITE_SUPABASE_URL: SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.warn(`Missing required environment variable: ${key}`);
  }
}
