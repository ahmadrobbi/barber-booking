import { createClient } from "@supabase/supabase-js";

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createAdminSupabase() {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_KEY"));
}
