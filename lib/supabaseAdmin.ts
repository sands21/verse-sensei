import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL for admin client");
}
if (!serviceKey) {
  // Do not throw at import time in dev; API routes can handle missing key
  // but we guard usage in routes.
}

export const supabaseAdmin: SupabaseClient | undefined =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : undefined;

export default supabaseAdmin;
