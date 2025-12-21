/**
 * Server-only error handling exports
 * This file should only be imported by server-side code
 */

// Server action middleware
export {
  withServerActionErrorHandling,
  createServerActionSuccess,
  createServerActionError,
  handleServerActionValidation,
  batchServerActions,
  type ServerActionOptions,
} from './middlewares/server-actions'

// API middleware
export { handleApiError, withApiErrorHandler, type ApiErrorResponse } from './middlewares/api.middleware'

// Server error handler
export { handleError as handleServerError } from './handlers/server.handler'
