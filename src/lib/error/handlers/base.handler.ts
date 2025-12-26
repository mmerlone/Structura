/**
 * Unified error handler that accepts logger injection
 * Works in both client and server environments with appropriate logger
 */

import type { Logger, LogLevel } from '@/types/logger.types'
import { coreHandleError, isAppError } from '../core/error.factory'
import type { AppError, ErrorContext } from '@/types/error.types'

export interface ErrorHandlerOptions {
  logger: Logger // Make logger required, no auto-detection
  logLevel?: LogLevel
}

export interface ErrorHandler {
  handleError: (error: unknown, context?: ErrorContext) => AppError
  logger: Logger
}

// Create error handler factory that accepts logger injection
export function createErrorHandler(options: ErrorHandlerOptions): ErrorHandler {
  const { logger } = options // Logger must be provided

  // Log errors with appropriate levels using context-first pattern
  function logError(error: AppError): void {
    const { message, code, context, stack } = error
    const logContext = {
      code,
      ...context,
      stack: stack !== null || (context.originalError as Error)?.stack,
      timestamp: new Date().toISOString(),
      errorName: error.constructor.name,
    }
    const statusCode = error.statusCode ?? 500

    if (statusCode >= 500) {
      logger.error(logContext, message)
    } else if (statusCode >= 400) {
      logger.warn(logContext, message)
    } else {
      logger.info(logContext, message)
    }
  }

  return {
    handleError: (error: unknown, context: ErrorContext = {}): AppError => {
      // Use core logic but add logging
      const appError = coreHandleError(error, context)

      // Only log if it's a new error (not already handled)
      if (!isAppError(error)) {
        logError(appError)
      }

      return appError
    },
    logger,
  }
}

// Note: Do not create a default handler here as it would be evaluated at module load time
// and cause issues with client/server environment detection.
// Instead, client.handler.ts and server.handler.ts create their own instances.

// Re-export getErrorType from core for convenience
export { getErrorType } from '../core/error.utils'

// Re-export types and enums for convenience
export type { AppError, ErrorContext } from '@/types/error.types'
export { AuthErrorTypeEnum } from '@/types/enums'
