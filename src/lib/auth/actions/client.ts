/**
 * Auth service module
 *
 * Provides a type-safe interface for authentication operations using Supabase.
 * This service wraps the server actions for client-side usage and provides
 * additional utilities for authentication state management.
 */

import type { AuthChangeEvent, Session, User as SupabaseUser, Provider } from '@supabase/supabase-js'

import { SITE_CONFIG } from '@/config/site'
import { handleClientError as handleError } from '@/lib/error'
import { buildLogger } from '@/lib/logger/client'
import { createClient } from '@/lib/supabase/client'
import type { LoginFormInput, SignOutReason } from '@/types/auth.types'
import { AuthProvidersEnum, SignOutReasonEnum } from '@/types/enums'

interface AuthServiceOptions {
  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean
}

type AuthClient = ReturnType<typeof createClient> | Awaited<ReturnType<typeof createClient>>

/**
 * Authentication service for handling auth operations.
 *
 * This service provides a type-safe interface for all authentication operations
 * and manages the Supabase client instance.
 */
export class AuthService {
  private static instance: AuthService | null = null
  private client: AuthClient
  private options: AuthServiceOptions
  private logger = buildLogger('AuthService')

  private constructor(client?: AuthClient, options: AuthServiceOptions = {}) {
    this.client = client || createClient()
    this.options = { debug: false, ...options }
  }

  /**
   * Get or create the AuthService singleton.
   *
   * If an instance does not yet exist, a new one is created. When a
   * Supabase client is provided after initialization, the instance's
   * client will be replaced which is helpful for server-side usage or
   * tests.
   *
   * @param client Optional Supabase client to use for this instance
   * @param options Optional configuration for the service instance
   * @returns The AuthService singleton
   */
  static getInstance(client?: AuthClient, options?: AuthServiceOptions): AuthService {
    if (AuthService.instance === null) {
      AuthService.instance = new AuthService(client, options)
    } else if (client) {
      AuthService.instance.client = client
      if (options) {
        AuthService.instance.options = { ...AuthService.instance.options, ...options }
      }
    }
    return AuthService.instance
  }

  /**
   * Create a new instance of AuthService.
   *
   * @param client The Supabase client to use
   * @param options Optional configuration
   * @returns A new AuthService instance
   */
  static create(client: AuthClient, options?: AuthServiceOptions): AuthService {
    return new AuthService(client, options)
  }

  /**
   * Create a new account using email and password.
   *
   * @param email The user's email address
   * @param password The user's password (must meet Supabase requirements)
   * @param options Additional registration options (currently only `name`)
   * @returns An object containing `data` with the created user (or null)
   *          and `error` when the operation fails
   * @example
   * ```typescript
   * const result = await authService.signUpWithEmail(
   *   'user@example.com',
   *   'securePassword123',
   *   { name: 'John Doe' }
   * );
   * if (result.error) {
   *   console.error('Registration failed:', result.error.message);
   * } else {
   *   console.log('Registration successful:', result.data.user);
   * }
   * ```
   */
  async signUpWithEmail(
    email: string,
    password: string,
    options: { name: string }
  ): Promise<{
    data: { user: SupabaseUser | null } | null
    error: Error | null
  }> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: options.name,
            email,
            full_name: options.name,
            avatar_url: '',
          },
          emailRedirectTo: `${SITE_CONFIG.url}/auth/confirm`,
        },
      })

      if (error) {
        const authError = handleError(error, {
          email,
          operation: 'signUp',
          provider: 'supabase',
          authMethod: 'email',
        })
        return {
          data: null,
          error: authError,
        }
      }

      return {
        data: {
          user: data?.user || null,
        },
        error: null,
      }
    } catch (error) {
      const authError = handleError(error, {
        email,
        operation: 'signUp',
        unexpected: true,
      })
      return {
        data: null,
        error: authError,
      }
    }
  }

  /**
   * Sign in using email and password credentials.
   *
   * @param credentials The validated login payload containing email and password
   * @returns An object containing `data` with the session and user on
   *          success, or `error` when the operation fails
   * @example
   * ```typescript
   * const result = await authService.signIn({
   *   email: 'user@example.com',
   *   password: 'securePassword123'
   * });
   * if (result.error) {
   *   console.error('Login failed:', result.error.message);
   * } else {
   *   console.log('Login successful:', result.data.user);
   * }
   * ```
   */
  async signIn(credentials: LoginFormInput): Promise<{
    data: { session: Session | null; user: SupabaseUser | null } | null
    error: Error | null
  }> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword(credentials)
      if (error) {
        const authError = handleError(error, {
          email: credentials.email,
          operation: 'signIn',
          provider: 'supabase',
          authMethod: 'email',
        })
        return { data: null, error: authError }
      }

      return {
        data: {
          session: data.session,
          user: data.user,
        },
        error: null,
      }
    } catch (error) {
      const authError = handleError(error, {
        email: credentials.email,
        operation: 'signIn',
        unexpected: true,
      })
      return {
        data: null,
        error: authError,
      }
    }
  }

  /**
   * Initiate an OAuth sign-in flow.
   *
   * @param provider The OAuth provider (e.g. Google, GitHub)
   * @returns An object with `error` set when the operation fails
   */
  async signInWithProvider(provider: AuthProvidersEnum): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.auth.signInWithOAuth({
        provider: provider.toLowerCase() as Provider,
        options: {
          redirectTo: `${SITE_CONFIG.url}/auth/callback`,
        },
      })

      if (error) {
        const authError = handleError(error, {
          provider,
          operation: 'signInWithProvider',
        })
        return { error: authError }
      }

      return { error: null }
    } catch (error) {
      const authError = handleError(error, {
        provider,
        operation: 'signInWithProvider',
        unexpected: true,
      })
      return { error: authError }
    }
  }

  /**
   * Sign out the current user.
   *
   * @param reason Optional reason for signing out — used for logging and conditional behavior
   * @returns An object with `error` set when the operation fails
   * @example
   * ```typescript
   * // User initiated sign out
   * const result = await authService.signOut(SignOutReasonEnum.USER_ACTION);
   *
   * // Session expired
   * const result = await authService.signOut(SignOutReasonEnum.SESSION_EXPIRED);
   * ```
   */
  async signOut(reason?: SignOutReason): Promise<{ error: Error | null }> {
    try {
      // Handle different sign-out reasons with appropriate logging and behavior
      switch (reason) {
        case SignOutReasonEnum.USER_ACTION:
          this.logger.info({ reason: 'user_action' }, 'User initiated sign out')
          // For user action, we can show a success message or redirect
          break

        case SignOutReasonEnum.SESSION_EXPIRED:
          this.logger.warn({ reason: 'session_expired' }, 'Signing out due to expired session')
          // For expired session, we might want to show a different message
          // and potentially store the intended destination for after re-login
          break

        case SignOutReasonEnum.USER_NOT_FOUND:
          this.logger.error({ reason: 'user_not_found' }, 'Signing out due to user not found')
          // For user not found, this might indicate a data inconsistency
          // We might want to clear local storage more aggressively
          break

        case SignOutReasonEnum.UNKNOWN:
        default:
          this.logger.warn({ reason: reason || 'unknown' }, 'Signing out for unknown reason')
          // For unknown reasons, we log with warning level
          break
      }

      const { error } = await this.client.auth.signOut()

      if (error) {
        const authError = handleError(error, {
          operation: 'signOut',
          originalError: new Error(reason),
        })
        return { error: authError }
      }

      // Log successful sign out with context
      this.logger.info(
        {
          reason: reason || 'manual',
          timestamp: new Date().toISOString(),
        },
        'User successfully signed out'
      )

      return { error: null }
    } catch (error: unknown) {
      const authError = handleError(error, {
        operation: 'signOut',
        originalError: new Error(reason),
      })
      return { error: authError }
    }
  }

  /**
   * Retrieve the current session from the Supabase client.
   *
   * @warning **CLIENT-SIDE ONLY!** This method uses `getSession()` which reads
   * from local storage and does NOT verify the session with the server. This is
   * safe and efficient for client components but INSECURE for server-side usage.
   *
   * For server-side authentication validation, use `getUser()` instead, which
   * makes a server request to verify the JWT token.
   *
   * @returns The current `Session` or `null` when not available
   * @see {@link getUser} for server-side authentication verification
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.client.auth.getSession()

      if (error) {
        return null
      }

      return data.session
    } catch {
      return null
    }
  }

  /**
   * Retrieve the current authenticated user.
   *
   * @returns The current `User` or `null` when not available
   */
  async getUser(): Promise<SupabaseUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser()

      if (error) {
        return null
      }

      return user
    } catch {
      return null
    }
  }

  /**
   * Send a password reset email to the provided address.
   *
   * @param email The email address to send the reset link to
   * @returns An object with `error` set when the operation fails
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_CONFIG.url}/auth/reset-password`,
      })

      if (error) {
        const authError = handleError(error, {
          email,
          operation: 'resetPassword',
          provider: 'supabase',
          authMethod: 'email',
        })
        return { error: authError }
      }

      return { error: null }
    } catch (error) {
      const authError = handleError(error, {
        email,
        operation: 'resetPassword',
        unexpected: true,
      })
      return { error: authError }
    }
  }

  /**
   * Update the password for the currently authenticated user.
   *
   * @param newPassword The new password to set
   * @returns An object with `error` set when the operation fails
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await this.client.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        const authError = handleError(error, {
          operation: 'updatePassword',
        })
        return { error: authError }
      }

      return { error: null }
    } catch (error) {
      const authError = handleError(error, {
        operation: 'updatePassword',
        unexpected: true,
      })
      return { error: authError }
    }
  }

  /**
   * Return whether there is an authenticated user session.
   *
   * @returns `true` when a session with a user exists, otherwise `false`
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession()
    return !!session?.user
  }

  /**
   * Subscribe to auth state changes
   * @param callback Function to call when auth state changes
   * @returns Unsubscribe function
   */
  /**
   * Maps Supabase auth change events to our custom AuthEventEnum.
   *
   * Currently this is an identity mapping but the method remains to
   * centralize any future translations between Supabase events and the
   * application's event enum.
   *
   * @see https://supabase.com/docs/reference/javascript/auth-onauthstatechange
   * @param event The Supabase auth event
   * @returns The mapped auth event
   * @private
   */
  private mapAuthEvent(event: AuthChangeEvent): AuthChangeEvent {
    return event
  }

  /**
   * Subscribe to authentication state changes emitted by Supabase.
   *
   * The provided callback will be invoked with a mapped event and the
   * current session. The returned function unsubscribes the auth listener.
   *
   * @param callback Called when an auth state change happens
   * @returns A function which unsubscribes the auth listener when called
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void {
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange((event, session) => {
      try {
        callback(this.mapAuthEvent(event), session)
      } catch (error) {
        // Catch and handle errors in the callback
        this.logger.error(
          {
            error,
            event,
            session: session?.user?.id !== null ? 'present' : 'none',
            timestamp: new Date().toISOString(),
          },
          'Error in auth state change callback'
        )

        // Re-throw to let error boundaries catch it
        throw error
      }
    })

    const cleanup = (): void => {
      subscription?.unsubscribe()
    }

    return cleanup
  }
}

/**
 * Default AuthService instance for Client Components.
 *
 * @warning DO NOT use this instance in Server Components or Route Handlers.
 * It uses a browser-based client and is a singleton, which is unsafe on the server.
 * Use `AuthService.create(client)` instead.
 */
export const authService = AuthService.getInstance()
