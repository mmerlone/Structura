import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { LogLevel, LoggerContext, Logger } from '@/types/logger.types'
import type { ErrorHandler } from './base.service'

/**
 * Common interface for all base services (client and server)
 * Ensures consistent API across different environments
 */
export interface IBaseService {
  /**
   * Handle errors consistently across all services
   * @param error - The error that occurred
   * @param operation - Description of the operation that failed
   * @param context - Additional context data
   * @returns Never returns, always throws an error
   * @throws {AppError} Always throws an AppError instance
   */
  handleError(error: unknown, operation: string, context?: LoggerContext): never

  /**
   * Helper to safely access nested properties
   * @param value - The value to check
   * @param defaultValue - Default value if value is null or undefined
   * @returns The value or default value
   */
  safeGet<T>(value: T | null | undefined, defaultValue: T): T

  /**
   * Unified logging method across client and server services
   * @param level - Log level from LogLevelEnum
   * @param message - Log message
   * @param context - Additional context
   */
  log(level: LogLevel, message: string, context?: LoggerContext): void
}

/**
 * Base service constructor interface
 */
export interface IBaseServiceConstructor {
  new (client: SupabaseClient<Database>, logger: Logger, errorHandler: ErrorHandler): IBaseService
  cleanup(): Promise<void>
}
