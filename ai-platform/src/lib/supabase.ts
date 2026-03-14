import { createClient } from '@supabase/supabase-js'

// These must match the names in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase credentials missing! Check your .env file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)