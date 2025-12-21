/**
 * Server-side error handling module
 * This module provides error handling functionality for server-side code using the unified handler
 */

import { logger as serverLogger } from '@/lib/logger/server'
import { createErrorHandler } from './base.handler'
import { getErrorType } from '../core/error.utils'

// Create server-specific error handler with explicit logger
const serverErrorHandler = createErrorHandler({
  logger: serverLogger,
})

export const handleError = serverErrorHandler.handleError
export { getErrorType }
