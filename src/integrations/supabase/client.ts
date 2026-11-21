import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// Keep SSR booting when a hosting environment has not been configured yet.
// Auth actions are blocked in the UI until real VITE_* values are present.
export const supabase = createClient(
  supabaseUrl || "https://not-configured.supabase.co",
  supabasePublishableKey || "sb_publishable_not_configured",
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  },
);
