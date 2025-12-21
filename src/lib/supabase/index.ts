/**
 * Supabase Client Exports
 *
 * This module serves as the main entry point for all Supabase-related functionality.
 * It provides clear exports for both client and server-side usage.
 */

// Middleware
export { updateSession } from './middleware'

// Re-export types for convenience
export type { Database } from '@/types/supabase'
