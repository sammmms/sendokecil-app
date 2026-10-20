import { createBrowserClient } from '@supabase/ssr';

export const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  return { url, key, isConfigured: Boolean(url && key) };
};

export const createClient = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return null;
  }
  return createBrowserClient(url, key);
};
