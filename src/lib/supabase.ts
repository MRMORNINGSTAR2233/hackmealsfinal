import { createClient } from '@supabase/supabase-js'

// Note: You'll need to get the anon key from your Supabase project settings
// Go to: Project Settings > API > Project API keys > anon public
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ihxuuualanshcprgiwpy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY is not set. Please add it to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          name: string
          email: string | null
          mobile: string
          team_name: string
          qr_code: string
          breakfast: boolean
          lunch: boolean
          dinner: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          mobile: string
          team_name: string
          qr_code: string
          breakfast?: boolean
          lunch?: boolean
          dinner?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          mobile?: string
          team_name?: string
          qr_code?: string
          breakfast?: boolean
          lunch?: boolean
          dinner?: boolean
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          username: string
          password: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password?: string
          created_at?: string
        }
      }
    }
  }
}