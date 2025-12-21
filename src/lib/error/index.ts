/**
 * Error handling module exports
 */

import type { Logger } from '@/types/logger.types'
import { createErrorHandler } from './handlers/base.handler'

// Error types and interfaces
export type {
  AppError,
  AppErrorJSON,
  AppErrorOptions,
  AuthErrorContext,
  BaseErrorContext,
  DatabaseErrorContext,
  ErrorContext,
  ErrorType,
  NetworkErrorContext,
  ServerActionContext,
  ValidationErrorContext,
} from '@/types/error.types'

// Error enums
export {
  AuthErrorCodeEnum,
  AuthErrorTypeEnum,
  DatabaseErrorCodeEnum,
  ErrorDomainEnum,
  ErrorTypeEnum,
  NetworkErrorCodeEnum,
  ServerErrorCodeEnum,
  ValidationErrorCodeEnum,
} from '@/types/enums'

// Error classes
export {
  AuthError,
  BaseAppError,
  BusinessError,
  ConfigurationError,
  DatabaseError,
  NetworkError,
  PermissionError,
  ValidationError,
} from './errors'

// Error handling utilities
export { createErrorHandler } from './handlers/base.handler'
export { isAppError, getErrorType } from './core/error.utils'

// Export client error handler
export { handleError as handleClientError } from './handlers/client.handler'

// Export factory for custom logger injection
export function createCustomErrorHandler(logger: Logger) {
  return createErrorHandler({ logger })
}

// Error codes and utilities (shared between client and server)
export {
  AUTH_ERROR_MESSAGES,
  DATABASE_ERROR_MESSAGES,
  ERROR_MESSAGES,
  ErrorCodeBuilder,
  ErrorCodes,
  NETWORK_ERROR_MESSAGES,
  SERVER_ERROR_MESSAGES,
  VALIDATION_ERROR_MESSAGES,
  type ErrorCodeStructure,
  type ErrorMessageMap,
} from './codes'
