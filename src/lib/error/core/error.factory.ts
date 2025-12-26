/**
 * Shared core error handling logic
 * This module contains the common error handling logic shared between client and server handlers
 */

import type { AuthApiError, PostgrestError } from '@supabase/supabase-js'

import { ErrorCodeBuilder, ErrorCodes } from '../codes'
import { AuthError, DatabaseError, NetworkError, ValidationError } from '../errors'
import {
  AppError,
  AuthErrorContext,
  DatabaseErrorContext,
  ErrorContext,
  NetworkErrorContext,
  ServerActionContext,
  ValidationErrorContext,
} from '@/types/error.types'

// Import type guards and utilities from error.utils
import {
  isServerActionContext,
  isNetworkErrorContext,
  isValidationErrorContext,
  isAuthErrorContext,
  isDatabaseErrorContext,
  isAppError,
  getErrorType,
} from './error.utils'

// Re-export for convenience
export {
  isServerActionContext,
  isNetworkErrorContext,
  isValidationErrorContext,
  isAuthErrorContext,
  isDatabaseErrorContext,
  isAppError,
  getErrorType,
}

// Type guard to check if unknown is an Error
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

// Type guard for Supabase AuthApiError
export function isSupabaseAuthError(error: unknown): error is AuthApiError {
  return isError(error) && 'code' in error && 'status' in error
}

// Type guard for Supabase PostgrestError
export function isSupabasePostgrestError(error: unknown): error is PostgrestError {
  return isError(error) && 'code' in error && 'details' in error && 'hint' in error
}

// Helper function to extract table name from Postgrest error
export function extractTableFromError(error: PostgrestError): string | undefined {
  if (error.details && typeof error.details === 'object' && 'table' in error.details) {
    return String((error.details as { table: unknown }).table)
  }
  return undefined
}

// Helper function to extract field name from validation error
export function extractFieldFromValidationError(error: Error): string | undefined {
  // Try to extract field name from common validation error patterns
  const fieldPattern = /field\s+["']([^"']+)["']/i
  const match = error.message.match(fieldPattern)
  return match ? match[1] : undefined
}

// Safely parse error details into a record structure
export function safeParseErrorDetails(details: unknown): Record<string, unknown> {
  if (details === null || details === undefined) {
    return {}
  }

  if (typeof details === 'object') {
    // If it's already an object, ensure it's a plain object
    if (Array.isArray(details)) {
      return { items: details }
    }

    // Convert to plain object to avoid potential class instances
    return { ...details }
  }

  if (typeof details === 'string') {
    try {
      // Try to parse JSON string
      const parsed = JSON.parse(details) as unknown
      return typeof parsed === 'object' && parsed !== null
        ? { ...(parsed as Record<string, unknown>) }
        : { message: details }
    } catch {
      // If parsing fails, treat as simple message
      return { message: details }
    }
  }

  // For other primitive types, wrap in message
  return { message: String(details) }
}

// Handle server action errors
export function handleServerActionError(error: unknown, context: ServerActionContext): AppError {
  return new DatabaseError({
    code: ErrorCodes.server.internalError(),
    message: 'An error occurred while processing your request',
    context: {
      ...context,
      originalError: error instanceof Error ? error : new Error(String(error)),
    },
    statusCode: 500,
  })
}

// Handle network errors
export function handleNetworkError(error: unknown, context: NetworkErrorContext): AppError {
  const errorObj = isError(error) ? error : new Error(String(error))

  const networkContext: NetworkErrorContext = {
    ...context,
    timeout: errorObj.message.includes('timeout') ? 5000 : undefined, // 5 seconds default timeout
    retryCount: 0,
  }

  const networkError = new NetworkError({
    code: ErrorCodes.network.connectionError(),
    message: ErrorCodeBuilder.getMessage(ErrorCodes.network.connectionError()),
    context: networkContext,
    statusCode: 503,
  })

  return networkError
}

// Handle validation errors
export function handleValidationError(error: unknown, context: ValidationErrorContext): AppError {
  const errorObj = isError(error) ? error : new Error(String(error))

  const validationContext: ValidationErrorContext = {
    ...context,
    field: extractFieldFromValidationError(errorObj),
  }

  const validationError = new ValidationError(errorObj.message, validationContext)

  return validationError
}

// Handle Supabase auth errors with code mapping
export function handleSupabaseAuthError(error: unknown, context: AuthErrorContext): AppError {
  if (!isSupabaseAuthError(error)) {
    // Fallback to generic auth error if it's not a Supabase auth error
    const errorObj = isError(error) ? error : new Error(String(error))
    const errorCode = ErrorCodes.auth.unknownError()
    return new AuthError({
      code: errorCode,
      message: ErrorCodeBuilder.getMessage(errorCode),
      context: {
        ...context,
        originalError: errorObj,
      },
      statusCode: 401,
    })
  }
  // Map common Supabase auth error codes to our structured format
  const errorMap: Record<string, { code: string; type: 'auth' | 'validation' | 'database' }> = {
    // Authentication errors
    invalid_credentials: { code: ErrorCodes.auth.invalidCredentials(), type: 'auth' },
    email_not_confirmed: { code: ErrorCodes.auth.emailNotConfirmed(), type: 'auth' },
    session_expired: { code: ErrorCodes.auth.sessionExpired(), type: 'auth' },
    user_not_found: { code: ErrorCodes.auth.userNotFound(), type: 'auth' },
    weak_password: { code: ErrorCodes.auth.weakPassword(), type: 'validation' },
    email_already_in_use: { code: ErrorCodes.auth.emailAlreadyInUse(), type: 'auth' },
    user_already_exists: { code: ErrorCodes.auth.emailAlreadyInUse(), type: 'auth' },
    invalid_token: { code: ErrorCodes.auth.invalidToken(), type: 'auth' },

    // Refresh token errors
    refresh_token_not_found: { code: ErrorCodes.auth.sessionExpired(), type: 'auth' },
    invalid_refresh_token: { code: ErrorCodes.auth.sessionExpired(), type: 'auth' },
    expired_refresh_token: { code: ErrorCodes.auth.sessionExpired(), type: 'auth' },

    // Rate limiting
    '429': { code: ErrorCodes.network.rateLimitExceeded(), type: 'auth' },
    rate_limit_exceeded: { code: ErrorCodes.network.rateLimitExceeded(), type: 'auth' },
  }

  const errorCode = error.code ?? 'unknown'
  const mappedError = errorMap[errorCode] || {
    code: ErrorCodes.auth.invalidToken(), // Fallback to auth error
    type: 'auth' as const,
  }

  const authContext: AuthErrorContext = {
    ...context,
    supabaseCode: errorCode,
    status: error.status,
    provider: 'supabase',
    authMethod: 'email',
    shouldSwitchToLogin: errorCode === 'user_already_exists',
  }

  const authError = new AuthError({
    code: mappedError.code,
    message: ErrorCodeBuilder.getMessage(mappedError.code),
    context: authContext,
    statusCode: error.status,
  })

  return authError
}

// Handle Supabase Postgrest errors with code mapping
export function handleSupabasePostgrestError(
  error: unknown,
  context: DatabaseErrorContext,
  extractTable: boolean = true
): AppError {
  if (!isSupabasePostgrestError(error)) {
    // Fallback to generic database error if it's not a Supabase Postgrest error
    const errorObj = isError(error) ? error : new Error(String(error))
    return new DatabaseError({
      code: ErrorCodes.database.unknownError(),
      message: ErrorCodeBuilder.getMessage(ErrorCodes.database.unknownError()),
      context: {
        ...context,
        originalError: errorObj,
      },
      statusCode: 500,
    })
  }
  // Map common Postgrest error codes to our structured format
  const errorMap: Record<string, { code: string; type: 'auth' | 'validation' | 'database' }> = {
    // Database errors
    PGRST116: { code: ErrorCodes.database.notFound(), type: 'database' },
    PGRST301: { code: ErrorCodes.database.relationNotFound(), type: 'database' },
    PGRST204: { code: ErrorCodes.database.noContent(), type: 'database' },

    // Validation errors
    '23505': { code: ErrorCodes.validation.duplicateEntry(), type: 'validation' },
    '23514': { code: ErrorCodes.validation.constraintViolation(), type: 'validation' },
    '23503': { code: ErrorCodes.validation.foreignKeyViolation(), type: 'validation' },
    '23502': { code: ErrorCodes.validation.notNullViolation(), type: 'validation' },
  }

  const mappedError = errorMap[error.code] || {
    code: ErrorCodes.database.unknownPostgrestError(),
    type: 'database' as const,
  }

  const dbContext: DatabaseErrorContext = {
    ...context,
    supabaseCode: error.code,
    details: safeParseErrorDetails(error.details),
    hint: error.hint,
    table: extractTable ? extractTableFromError(error) : undefined,
  }

  const databaseError = new DatabaseError({
    code: mappedError.code,
    message: ErrorCodeBuilder.getMessage(mappedError.code),
    context: dbContext,
    statusCode: 400, // Most Postgrest errors are 400
  })

  return databaseError
}

// Core error handling logic that can be used by both client and server handlers
export function coreHandleError(error: unknown, context: ErrorContext = {}): AppError {
  // Already handled AppError
  if (isAppError(error)) {
    return error
  }

  // Handle based on context type first
  if (isServerActionContext(context)) {
    return handleServerActionError(error, context)
  }

  if (isNetworkErrorContext(context)) {
    return handleNetworkError(error, context)
  }

  if (isValidationErrorContext(context)) {
    return handleValidationError(error, context)
  }

  if (isAuthErrorContext(context)) {
    return handleSupabaseAuthError(error, context)
  }

  if (isDatabaseErrorContext(context)) {
    return handleSupabasePostgrestError(error, context, true)
  }

  // Fallback for unknown errors
  const fallbackError = new DatabaseError({
    code: ErrorCodes.server.unknownError(),
    message: ErrorCodeBuilder.getMessage(ErrorCodes.server.unknownError()),
    context: {
      ...(context && typeof context === 'object' ? context : {}),
      originalError: error instanceof Error ? error : new Error(String(error)),
    },
    statusCode:
      error !== null && typeof error === 'object' && 'status' in error ? (error as { status: number }).status : 500,
  })

  return fallbackError
}

// getErrorType is imported from error.utils.ts
