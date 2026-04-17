import { createClient } from '@supabase/supabase-js'

// Client Supabase côté serveur — pour generateStaticParams et sitemap.
// N'utilise pas @supabase/ssr car ces contextes n'ont pas accès aux cookies.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
