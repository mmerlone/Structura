import type { ErrorContext, AppError } from '@/types/error.types'

export function isAuthErrorContext(context: ErrorContext): context is ErrorContext {
  return 'provider' in context || 'authMethod' in context || 'authErrorType' in context
}

export function isNetworkErrorContext(context: ErrorContext): boolean {
  return 'url' in context || 'method' in context
}

export function isValidationErrorContext(context: ErrorContext): boolean {
  return 'field' in context || 'validationErrors' in context
}

export function isDatabaseErrorContext(context: ErrorContext): boolean {
  return 'table' in context || 'constraint' in context
}

export function isServerActionContext(context: ErrorContext): boolean {
  return 'operationType' in context || 'hook' in context
}

export function getErrorType(context: ErrorContext): string {
  if (isAuthErrorContext(context)) return 'AUTH_ERROR'
  if (isNetworkErrorContext(context)) return 'NETWORK_ERROR'
  if (isValidationErrorContext(context)) return 'VALIDATION_ERROR'
  if (isDatabaseErrorContext(context)) return 'DATABASE_ERROR'
  if (isServerActionContext(context)) return 'SERVER_ACTION_ERROR'
  return 'UNKNOWN_ERROR'
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error && 'context' in error && 'isOperational' in error
}
