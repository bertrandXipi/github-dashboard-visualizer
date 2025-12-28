import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type RepoSummary = {
  id?: number
  repo_id: number
  repo_name: string
  owner: string
  summary: string
  created_at?: string
  updated_at?: string
}
