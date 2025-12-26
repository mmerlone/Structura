'use server'

import { ErrorCodes } from '@/lib/error/codes'
import { AuthError } from '@/lib/error/errors'
import {
  createServerActionSuccess,
  handleServerActionValidation,
  withServerActionErrorHandling,
} from '@/lib/error/server'
import type { AppError } from '@/types/error.types'
import { buildLogger } from '@/lib/logger/server'
import { createClient } from '@/lib/supabase/server'
import { forgotPasswordEmailSchema, loginSchema, registerSchema, updatePasswordSchema } from '@/lib/validators/auth'
import type {
  LoginFormInput,
  RegisterFormInput,
  ResetPasswordEmailFormInput,
  UpdatePasswordFormInput,
} from '@/types/auth.types'

const logger = buildLogger('auth-server-actions')

/**
 * Standardized response type for authentication operations
 * @template T - Type of the data payload in successful responses
 */
export type AuthResponse<T = unknown> = {
  /** Whether the operation was successful */
  success: boolean
  /** Response data for successful operations */
  data?: T
  /** Structured error object for failed operations */
  error?: AppError | string
  /** Optional success message */
  message?: string
}

/**
 * Handles user authentication with email and password
 * @param credentials - User login credentials
 * @param credentials.email - User's email address
 * @param credentials.password - User's password
 * @returns Promise resolving to authentication result with user ID on success
 * @throws {Error} If login is successful but no user ID is returned
 *
 * @example
 * ```typescript
 * const result = await signInWithEmail({
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * });
 * if (result.success) {
 *   // Handle successful login
 *   const userId = result.data.userId;
 * }
 * ```
 */
export const signInWithEmail = withServerActionErrorHandling(
  async (credentials: LoginFormInput): Promise<AuthResponse<{ userId: string }>> => {
    // Validate input
    const validated = loginSchema.safeParse(credentials)
    const validationError = handleServerActionValidation<{ userId: string }>(validated, {
      email: credentials.email,
      operation: 'signIn',
    })
    if (validationError) return validationError

    // Authenticate with Supabase - validated.data is guaranteed to exist after validation
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.data!.email,
      password: validated.data!.password,
    })

    if (error) {
      throw error // Let the middleware handle this
    }

    const userId = data.user?.id
    if (!userId) {
      throw new AuthError({
        code: ErrorCodes.auth.userNotFound(),
        message: 'Login completed but user ID could not be retrieved',
        context: { operation: 'signIn' },
        statusCode: 500,
      })
    }

    logger.info({ userId }, 'User successfully logged in')
    return createServerActionSuccess({ userId }, 'Login successful')
  },
  {
    operation: 'signIn',
    revalidatePaths: ['/'],
    successMessage: 'Login successful',
  }
)

/**
 * Handles new user registration with email and password
 * @param credentials - User registration data
 * @param credentials.email - User's email address
 * @param credentials.password - User's password
 * @param credentials.name - User's full name
 * @param credentials.confirmPassword - Password confirmation (must match password)
 * @param credentials.acceptTerms - Whether user accepted terms and conditions
 * @returns Promise resolving to registration result with user ID on success
 *
 * @example
 * ```typescript
 * const result = await signUpWithEmail({
 *   email: 'new@example.com',
 *   password: 'securePassword123',
 *   name: 'John Doe',
 *   confirmPassword: 'securePassword123',
 *   acceptTerms: true
 * });
 * ```
 */
export const signUpWithEmail = withServerActionErrorHandling(
  async (credentials: RegisterFormInput): Promise<AuthResponse<{ userId: string }>> => {
    logger.debug({ email: credentials.email }, 'Initiating user registration')

    // Validate input
    const validated = registerSchema.safeParse(credentials)
    const validationError = handleServerActionValidation<{ userId: string }>(validated, {
      email: credentials.email,
      operation: 'signUp',
    })
    if (validationError) return validationError

    // Register with Supabase - validated.data is guaranteed to exist after validation
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email: validated.data!.email,
      password: validated.data!.password,
      options: {
        data: {
          name: validated.data!.name,
        },
      },
    })

    if (error) {
      throw error // Let the middleware handle this
    }

    const userId = data.user?.id
    if (userId === null || userId === undefined) {
      throw new AuthError({
        code: ErrorCodes.auth.userNotFound(),
        message: 'Registration completed but user ID could not be retrieved',
        context: { operation: 'signUp' },
        statusCode: 500,
      })
    }

    logger.info({ userId, email: validated.data!.email }, 'User successfully registered')
    return createServerActionSuccess({ userId }, 'Registration successful')
  },
  {
    operation: 'signUp',
    revalidatePaths: ['/'],
    successMessage: 'Registration successful',
  }
)

/**
 * Terminates the current user session
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * const result = await signOut();
 * if (result.success) {
 *   // Redirect to login page
 * }
 * ```
 */
export const signOut = withServerActionErrorHandling(
  async (): Promise<AuthResponse> => {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error // Let the middleware handle this
    }

    logger.info({}, 'User successfully signed out')
    return createServerActionSuccess(undefined, 'Signed out successfully')
  },
  {
    operation: 'signOut',
    revalidatePaths: ['/'],
    successMessage: 'Signed out successfully',
  }
)

/**
 * Initiates the password reset flow by sending a reset email
 * @param data - Password reset request data
 * @param data.email - Email address to send reset instructions to
 * @returns Promise resolving to operation result
 *
 * @example
 * ```typescript
 * const result = await requestPasswordReset({
 *   email: 'user@example.com'
 * });
 * ```
 */
export const requestPasswordReset = withServerActionErrorHandling(
  async (data: ResetPasswordEmailFormInput): Promise<AuthResponse> => {
    logger.debug({ email: data.email }, 'Processing password reset request')

    // Validate input
    const validated = forgotPasswordEmailSchema.safeParse(data)
    const validationError = handleServerActionValidation<void>(validated, {
      email: data.email,
      operation: 'requestPasswordReset',
    })
    if (validationError) return validationError

    // Send reset email - validated.data is guaranteed to exist after validation
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(validated.data!.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      throw error // Let the middleware handle this
    }

    logger.info({ email: validated.data!.email }, 'Password reset email sent')
    return createServerActionSuccess(undefined, 'Password reset link sent. Please check your email.')
  },
  {
    operation: 'requestPasswordReset',
    successMessage: 'Password reset link sent. Please check your email.',
  }
)

/**
 * Updates a user's password validating the actor either by:
 * - Current password verification (when changing password while logged in)
 * - Reset password token sent by the reset password operation
 *
 * @param data - Password update parameters
 * @param data.currentPassword - Required when changing password while logged in
 * @param data.newPassword - The new password to set (must meet complexity requirements)
 * @returns Promise resolving to operation result
 *
 * @example
 * // Password reset (forgot password flow)
 * await updateUserPassword({
 *   newPassword: 'newSecurePassword123!'
 * });
 *
 * // Password change (while logged in)
 * await updateUserPassword({
 *   currentPassword: 'oldPassword123',
 *   newPassword: 'newSecurePassword123!'
 * });
 */
export const updateUserPassword = withServerActionErrorHandling(
  async (data: UpdatePasswordFormInput & { currentPassword?: string }): Promise<AuthResponse> => {
    // Validate input
    const validated = updatePasswordSchema.safeParse(data)
    const validationError = handleServerActionValidation<void>(validated, {
      operation: 'updatePassword',
    })
    if (validationError) return validationError

    const supabase = await createClient()

    // If currentPassword is provided, verify it first (password change flow)
    if (data.currentPassword) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email === null || user?.email === undefined) {
        throw new AuthError({
          code: ErrorCodes.auth.invalidToken(),
          message: 'User authentication required',
          context: { operation: 'updatePassword' },
          statusCode: 401,
        })
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      })

      if (authError) {
        throw authError // Let the middleware handle this
      }
    }

    // Update to new password - validated.data is guaranteed to exist after validation
    const { error } = await supabase.auth.updateUser({
      password: validated.data!.newPassword,
    })

    if (error) {
      throw error // Let the middleware handle this
    }

    logger.info({}, 'Password updated successfully')
    return createServerActionSuccess(undefined, 'Password updated successfully')
  },
  {
    operation: 'updatePassword',
    successMessage: 'Password updated successfully',
  }
)
