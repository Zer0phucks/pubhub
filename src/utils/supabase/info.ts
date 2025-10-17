// Supabase project configuration
export const projectId = (import.meta.env?.VITE_SUPABASE_URL as string | undefined)?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'vcdfzxjlahsajulpxzsn';
export const publicAnonKey = (import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined) || '';
