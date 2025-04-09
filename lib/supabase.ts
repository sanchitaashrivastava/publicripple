import { createClient } from "@supabase/supabase-js"

// Check if the environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate the environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Some functionality may be limited.")
}

// Create a Supabase client with error handling
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-key",
)

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!supabaseUrl && !!supabaseAnonKey
}
