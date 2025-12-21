import type { ZodIssue } from 'zod'

import type { BaseErrorContext, ServerActionContext } from '@/types/error.types'

import type { AuthResponse } from '@/lib/auth/actions/server'
import { handleServerError as handleError } from '@/lib/error/server'
import { buildLogger } from '@/lib/logger/server'

const logger = buildLogger('server-actions-middleware')

/**
 * Zod validation error interface for type safety
 */
interface ZodValidationError {
  issues: ZodIssue[]
}

/**
 * Configuration options for server action error handling
 */
export interface ServerActionOptions {
  /** Operation name for logging and error context */
  operation: string
  /** Additional context to include with errors */
  context?: BaseErrorContext
  /** Whether to revalidate paths on success */
  revalidatePaths?: string[]
  /** Custom success message */
  successMessage?: string
}

/**
 * Server action wrapper that provides standardized error handling and logging
 *
 * @param handler - The server action function to wrap
 * @param options - Configuration options for the wrapper
 * @returns Wrapped server action with standardized error handling
 */
export function withServerActionErrorHandling<Args extends readonly unknown[], T = unknown>(
  handler: (...args: Args) => Promise<AuthResponse<T>>,
  options: ServerActionOptions
) {
  return async (...args: Args): Promise<AuthResponse<T>> => {
    const startTime = Date.now()
    const { operation, context = {}, revalidatePaths, successMessage } = options

    try {
      logger.info({ operation, argsCount: args.length }, `Starting server action: ${operation}`)

      // Execute the original handler
      const result = await handler(...args)

      // Log successful completion
      const duration = Date.now() - startTime
      logger.info(
        {
          operation,
          duration,
          success: result.success,
          hasData: result.data ?? false,
          hasError: result.error ?? false,
        },
        `Server action completed: ${operation}`
      )

      // Handle revalidation if specified
      if (result.success && revalidatePaths && revalidatePaths.length > 0) {
        const { revalidatePath } = await import('next/cache')
        revalidatePaths.forEach((path) => revalidatePath(path))
        logger.debug({ operation, revalidatePaths }, 'Paths revalidated')
      }

      // Add success message if provided and operation was successful
      if (result.success && successMessage !== null) {
        return {
          ...result,
          message: successMessage,
        }
      }

      return result
    } catch (error) {
      // Handle unexpected errors with structured error handling
      const duration = Date.now() - startTime
      const appError = handleError(error, {
        operation,
        duration,
        unexpected: true,
        argsCount: args.length,
        ...context,
      })

      logger.error(
        {
          operation,
          duration,
          error: appError,
          argsCount: args.length,
        },
        `Server action failed: ${operation}`
      )

      return {
        success: false,
        error: appError,
        data: undefined,
      }
    }
  }
}

/**
 * Creates a standardized success response for server actions
 *
 * @param data - The successful response data
 * @param message - Optional success message
 * @returns Standardized success response
 */
export function createServerActionSuccess<T = unknown>(data: T, message?: string): AuthResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

/**
 * Creates a standardized error response for server actions
 *
 * @param error - The error to convert to structured response
 * @param context - Additional context for error handling
 * @returns Standardized error response
 */
export function createServerActionError(
  error: unknown,
  context: ServerActionContext & { duration?: number; batchIndex?: number } = {}
): AuthResponse<never> {
  const appError = handleError(error, context)

  return {
    success: false,
    error: appError,
    data: undefined,
  }
}

/**
 * Validates server action arguments and creates appropriate error responses
 *
 * @param validation - Zod validation result
 * @param context - Additional context for validation errors
 * @returns Error response if validation fails, null if validation passes
 */
export function handleServerActionValidation<T>(
  validation: { success: boolean; error?: ZodValidationError },
  context: BaseErrorContext = {}
): AuthResponse<T> | null {
  if (!validation.success) {
    const validationError = handleError(validation.error, {
      ...context,
      // Validation details are handled by ValidationErrorContext
      validationErrors: validation.error?.issues || [],
    })

    return {
      success: false,
      error: validationError,
      data: undefined,
    }
  }

  return null
}

/**
 * Batch operation helper for multiple server actions
 *
 * @param operations - Array of server operations to execute
 * @param options - Configuration options for batch processing
 * @returns Batch operation results
 */
export async function batchServerActions<T = unknown>(
  operations: Array<() => Promise<AuthResponse<T>>>,
  options: {
    stopOnFirstError?: boolean
    operation?: string
  } = {}
): Promise<{
  results: AuthResponse<T>[]
  successCount: number
  errorCount: number
  hasErrors: boolean
}> {
  const { stopOnFirstError = false, operation = 'batch-operation' } = options
  const results: AuthResponse<T>[] = []
  let successCount = 0
  let errorCount = 0

  logger.info({ operation, operationsCount: operations.length }, `Starting batch operation: ${operation}`)

  for (const serverAction of operations) {
    try {
      const result = await serverAction()
      results.push(result)

      if (result.success) {
        successCount++
      } else {
        errorCount++

        if (stopOnFirstError) {
          logger.warn({ operation, errorCount: 1 }, 'Batch operation stopped due to first error')
          break
        }
      }
    } catch (error) {
      const errorResult = createServerActionError(error, { operation, batchIndex: results.length })
      results.push(errorResult)
      errorCount++

      if (stopOnFirstError) {
        logger.warn({ operation, errorCount: 1 }, 'Batch operation stopped due to first unexpected error')
        break
      }
    }
  }

  const hasErrors = errorCount > 0
  const duration = Date.now()

  logger.info(
    {
      operation,
      totalOperations: operations.length,
      successCount,
      errorCount,
      hasErrors,
      duration,
    },
    `Batch operation completed: ${operation}`
  )

  return {
    results,
    successCount,
    errorCount,
    hasErrors,
  }
}
