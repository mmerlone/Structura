/**
 * Client-side error handling module
 * This module provides error handling functionality for client-side code using the unified handler
 */

import { createErrorHandler } from './base.handler'
import { getErrorType } from '../core/error.utils'
import { AuthErrorTypeEnum } from '@/types/enums'
import { logger as clientLogger } from '@/lib/logger/client'

// Create client-specific error handler with explicit client logger
const clientErrorHandler = createErrorHandler({
  logger: clientLogger,
})

export const handleError = clientErrorHandler.handleError
export { getErrorType }

// Re-export AuthErrorTypeEnum for client-side usage
export { AuthErrorTypeEnum }
