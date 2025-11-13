import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Key must be defined in .env file with VITE_ prefix");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
