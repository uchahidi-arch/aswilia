import { createBrowserClient } from '@supabase/ssr'

// ─── Client côté navigateur (composants 'use client') ───────────────────────
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton — évite de recréer le client à chaque render
let _client: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!_client) _client = createClient()
  return _client
}

// Export nommé direct — compatible avec import { supabase } from '@/lib/supabase'
export const supabase = getSupabaseClient()
