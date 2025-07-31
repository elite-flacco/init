import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Public client for frontend operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      shared_plans: {
        Row: {
          id: string
          destination: Record<string, unknown>
          traveler_type: Record<string, unknown>
          ai_response: Record<string, unknown>
          created_at: string
          expires_at: string
        }
        Insert: {
          id: string
          destination: Record<string, unknown>
          traveler_type: Record<string, unknown>
          ai_response: Record<string, unknown>
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          destination?: Record<string, unknown>
          traveler_type?: Record<string, unknown>
          ai_response?: Record<string, unknown>
          created_at?: string
          expires_at?: string
        }
      }
    }
  }
}