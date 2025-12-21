import type { AuthUser, Session } from '@supabase/supabase-js'

import type { AuthOperationsEnum, AuthProvidersEnum, SignOutReasonEnum } from './enums'

import type { AppError, AuthErrorContext } from '@/types/error.types'

// Re-export AuthUser and Session
export type { AuthUser, Session }

/**
 * Type representing an authentication operation.
 * This is a string union type of all possible AuthOperations enum values.
 */
export type AuthOperations = `${AuthOperationsEnum}`

/**
 * Represents the authentication result
 */
export type AuthResult = {
  error: Error | null
  data?: unknown
}

/**
 * Type representing the string literal union of all AuthProvider values.
 *
 * @remarks
 * This type is derived from the AuthProvider enum and represents all possible
 * string values that can be used to identify an authentication provider.
 *
 * @example
 * ```typescript
 * // Valid values
 * const provider: AuthProviderValue = 'google'; // Valid
 * const provider2: AuthProviderValue = 'github'; // Valid
 *
 * // TypeScript error - invalid provider
 * const invalidProvider: AuthProviderValue = 'twitter'; // Error
 * ```
 */
export type AuthProviderValue = `${AuthProvidersEnum}`
export type SignOutReason = `${SignOutReasonEnum}`

/**
 * Configuration for an authentication provider in the application.
 * It includes provider-specific settings and OAuth parameters.
 *
 * @example
 * ```typescript
 * const googleConfig: AuthProviderConfig = {
 *   id: 'google',
 *   name: 'Google',
 *   scopes: 'email profile',
 *   params: {
 *     prompt: 'select_account',
 *     access_type: 'offline'
 *   }
 * };
 * ```
 */
export interface AuthProviderConfig {
  /**
   * The authentication provider identifier.
   * Must be one of the values from the AuthProvidersEnum.
   */
  id: AuthProviderValue

  /**
   * Display name of the authentication provider.
   * This is typically shown on the UI.
   */
  name: string

  /**
   * OAuth scopes to request from the provider.
   * Multiple scopes should be space-separated.
   *
   * @example
   * 'email profile openid'
   */
  scopes?: string
}

/**
 * Options for the sign-in process.
 *
 * @remarks
 * This interface defines optional parameters that can be passed when initiating
 * the authentication flow.
 */
export interface SignInOptions {
  /**
   * The URL to redirect to after successful authentication.
   * If not provided, the user will be redirected to the default route.
   */
  redirectTo?: string

  /**
   * Override the default scopes for this authentication request.
   * If not provided, the scopes from the provider configuration will be used.
   */
  scopes?: string

  /**
   * Additional query parameters to include in the authentication request.
   * These will be appended to the OAuth URL.
   */
  queryParams?: Record<string, string>
}

/**
 * Type representing the authentication context
 */
export interface AuthContextType {
  // Auth state
  authUser: AuthUser | null
  session: Session | null
  error: AppError | null
  isLoading: boolean

  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: AppError | null }>
  signInWithProvider: (provider: AuthProvidersEnum) => Promise<{ error: AppError | null }>
  signUpWithEmail: (email: string, password: string, options: { name: string }) => Promise<{ error: AppError | null }>
  resetPassword: (email: string) => Promise<{ error: AppError | null }>
  updatePassword: (password: string) => Promise<{ error: AppError | null }>
  signOut: (reason?: SignOutReason) => Promise<{ error: AppError | null }>
  refreshSession: () => Promise<void>

  // Utilities
  hasRole: (role: string) => boolean
  isCurrentUser: (userId: string) => boolean

  // Error boundary integration
  clearError: () => void
  getErrorForDisplay: () => {
    message: string
    code: string
    context?: AuthErrorContext
    isOperational: boolean
    statusCode: number | undefined
  } | null
  getErrorCode: () => string | null
  isAuthError: () => boolean
  isValidationError: () => boolean
  isNetworkError: () => boolean
}

/**
 * Form input types for authentication forms
 */

export interface LoginFormInput {
  email: string
  password: string
}

export interface RegisterFormInput extends LoginFormInput {
  confirmPassword: string
  name: string
  acceptTerms: boolean
}

/**
 * Type for signup credentials, excluding confirmPassword and acceptTerms
 * Used when submitting signup forms where these fields are handled separately
 */
export type SignupCredentials = Omit<RegisterFormInput, 'confirmPassword' | 'acceptTerms'> & {
  /**
   * User's full name
   */
  name: string
}

export interface ResetPasswordEmailFormInput {
  email: string
}

export interface ResetPasswordPassFormInput {
  password: string
  confirmPassword: string
}

export interface UpdatePasswordFormInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type FormTypeMap = {
  [AuthOperationsEnum.LOGIN]: LoginFormInput
  [AuthOperationsEnum.REGISTER]: RegisterFormInput
  [AuthOperationsEnum.FORGOT_PASSWORD]: ResetPasswordEmailFormInput
  [AuthOperationsEnum.RESET_PASSWORD]: ResetPasswordPassFormInput
  [AuthOperationsEnum.UPDATE_PASSWORD]: UpdatePasswordFormInput
}

// Type guard for form inputs
export function isLoginFormInput(data: unknown): data is LoginFormInput {
  return (
    typeof data === 'object' && data !== null && 'email' in data && 'password' in data && Object.keys(data).length === 2
  )
}

export function isRegisterFormInput(data: unknown): data is RegisterFormInput {
  return (
    typeof data === 'object' &&
    data !== null &&
    'email' in data &&
    'password' in data &&
    'confirmPassword' in data &&
    'name' in data &&
    'acceptTerms' in data &&
    Object.keys(data).length === 5
  )
}
