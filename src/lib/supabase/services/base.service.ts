import type { SupabaseClient } from '@supabase/supabase-js'
import type { DatabaseErrorContext, AppError } from '@/types/error.types'
import type { Database } from '@/types/supabase'
import type { IBaseService } from './base.interface'
import type { LogLevel, LoggerContext, Logger } from '@/types/logger.types'

/**
 * Error handler function type for dependency injection
 * Returns an AppError that should be thrown by the caller
 */
export type ErrorHandler = (error: unknown, context: DatabaseErrorContext) => AppError

/**
 * Universal base service with dependency injection for all concerns
 *
 * ## Dependency Injection
 * - **Client**: Supabase client instance
 * - **Logger**: Logger instance (client or server)
 * - **Error Handler**: Error handling function (client or server)
 *
 * ## Benefits
 * - **No code duplication**: Single implementation for all environments
 * - **Testable**: All dependencies can be mocked
 * - **Flexible**: Different configurations per environment
 * - **Consistent**: Same API across client and server
 *
 * @example
 * ```typescript
 * // Server usage
 * const service = new UserService(
 *   serverClient,
 *   serverLogger,
 *   handleServerError
 * )
 *
 * // Client usage
 * const service = new UserService(
 *   clientClient,
 *   clientLogger,
 *   handleClientError
 * )
 * ```
 */
export abstract class BaseService implements IBaseService {
  protected client: SupabaseClient<Database>
  protected logger: Logger
  protected errorHandler: ErrorHandler

  /**
   * Create a new BaseService instance
   * @param client - Required Supabase client (explicit injection)
   * @param logger - Required logger instance (explicit injection)
   * @param errorHandler - Required error handler function (explicit injection)
   */
  constructor(client: SupabaseClient<Database>, logger: Logger, errorHandler: ErrorHandler) {
    this.client = client
    this.logger = logger
    this.errorHandler = errorHandler
  }

  /**
   * Handle errors consistently across all services
   * @param error - The error that occurred
   * @param operation - Description of the operation that failed
   * @param context - Additional context data
   * @returns Never returns, always throws an error
   * @throws {AppError} Always throws an AppError instance
   */
  handleError(error: unknown, operation: string, context: LoggerContext = {}): never {
    const errorContext: DatabaseErrorContext = {
      operation,
      ...context,
      service: this.constructor.name,
    }

    // Use the injected error handler and throw the result
    const appError = this.errorHandler(error, errorContext)
    throw appError
  }

  /**
   * Clean up resources
   * Simplified cleanup - client instances are now managed individually
   * @returns Promise that resolves when cleanup is complete
   */
  static async cleanup(): Promise<void> {
    // No-op - individual client instances manage their own cleanup
    // This method kept for backward compatibility
  }

  /**
   * Helper to safely access nested properties
   * @param value - The value to check
   * @param defaultValue - Default value if value is null or undefined
   * @returns The value or default value
   */
  safeGet<T>(value: T | null | undefined, defaultValue: T): T {
    return value ?? defaultValue
  }

  /**
   * Universal logging method that works with any injected logger
   * @param level - Log level
   * @param message - Log message
   * @param context - Additional context
   */
  log(level: LogLevel, message: string, context?: LoggerContext): void {
    const logContext = context || {}

    switch (level) {
      case 'debug':
        this.logger.debug(logContext, message)
        break
      case 'info':
        this.logger.info(logContext, message)
        break
      case 'warn':
        this.logger.warn(logContext, message)
        break
      case 'error':
        this.logger.error(logContext, message)
        break
    }
  }
}
