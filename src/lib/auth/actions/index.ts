/**
 * Authentication Module
 *
 * This module provides authentication services for the application, handling both
 * client and server-side authentication operations.
 *
 * @module lib/auth/actions
 *
 * @example
 * // Client-side usage
 * import { signInWithEmail } from '@/lib/auth/actions'
 *
 * // Server-side usage (in Server Components or Route Handlers)
 * import { auth } from '@/lib/auth/actions'
 */

/**
 * Authentication module barrel exports
 *
 * This file provides a single entry point for all authentication-related functionality,
 * including client-side services, server-side actions, and shared types.
 *
 * @module @/lib/auth/actions
 */

// Client-side exports
export * from './client'

// Server-side exports
export * from './server'

// Common types
export type { AuthResponse } from './server'
