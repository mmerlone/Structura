'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { logger } from '@/lib/logger/server'
import type { Database } from '@/types/supabase'

/**
 * Creates a Supabase client for server-side usage
 * This should only be used in Server Components, Route Handlers, and Server Actions
 *
 * @returns Promise<SupabaseClient<Database>> - The configured Supabase client
 */
// Export a generic function name for consistency with client-side usage
export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            logger.warn({ error }, 'Supabase cookie set failed (ignorable in Server Components)')
          }
        },
      },
    }
  )
}
