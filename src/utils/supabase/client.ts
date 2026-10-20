import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ceargvawthyncgpojgbd.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_qpz6tTUOwg8nBbqCwVvGXw_ydYJpBv6";

export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  key: supabaseKey,
  isConfigured: Boolean(supabaseUrl && supabaseKey),
});

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );
