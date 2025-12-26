// Standardized error types for the application
import { ErrorTypeEnum, AuthErrorTypeEnum } from '@/types/enums'

export type ErrorType = `${ErrorTypeEnum}`

/**
 * Base context interface for errors
 */
export interface BaseErrorContext {
  // Core identification
  userId?: string
  email?: string
  operation?: string
  requestId?: string
  service?: string

  // Error metadata
  code?: string
  statusCode?: number
  isOperational?: boolean
  originalError?: unknown // Raw error object
}

/**
 * Authentication error context
 */
export interface AuthErrorContext extends BaseErrorContext {
  provider?: string
  authMethod?: string
  sessionExpired?: boolean
  supabaseCode?: string
  status?: number
  authErrorType?: AuthErrorTypeEnum
  shouldSwitchToLogin?: boolean
}

/**
 * Network error context
 */
export interface NetworkErrorContext extends BaseErrorContext {
  url?: string
  method?: string
  clientIp?: string
  userAgent?: string
  timeout?: number
  retryCount?: number
  statusCode?: number
}

/**
 * Server action error context
 */
export interface ServerActionContext extends BaseErrorContext {
  operationType?: string
  duration?: number
  unexpected?: boolean
  argsCount?: number
  hook?: string
}

/**
 * Database error context
 */
export interface DatabaseErrorContext extends BaseErrorContext {
  table?: string
  query?: string
  constraint?: string
  details?: Record<string, unknown>
  hint?: string
  supabaseCode?: string
}

/**
 * Validation error context
 */
export interface ValidationErrorContext extends BaseErrorContext {
  field?: string
  validationErrors?: unknown[]
  validationDetails?: unknown
}

/**
 * Union of all possible error contexts
 */
export type ErrorContext =
  | AuthErrorContext
  | DatabaseErrorContext
  | ValidationErrorContext
  | NetworkErrorContext
  | ServerActionContext
  | BaseErrorContext

/**
 * Base options for creating structured errors
 */
export interface AppErrorOptions<TContext extends ErrorContext = BaseErrorContext> {
  code: string
  message: string
  context?: TContext
  cause?: Error | AppError | null
  isOperational?: boolean
  statusCode?: number
}

/**
 * Standardized error interface without timestamp (database-managed)
 */
export interface AppError<TContext extends ErrorContext = BaseErrorContext> extends Error {
  readonly code: string
  readonly context: TContext
  readonly isOperational: boolean
  readonly statusCode?: number
  readonly cause?: Error | AppError | null
  readonly errorType: ErrorType

  toJSON(): AppErrorJSON<TContext>
}

/**
 * JSON representation of AppError
 */
export interface AppErrorJSON<TContext extends ErrorContext = BaseErrorContext> {
  code: string
  message: string
  context?: TContext
  isOperational: boolean
  statusCode?: number
  errorType: ErrorType
  stack?: string
}
