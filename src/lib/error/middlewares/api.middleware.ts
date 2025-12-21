import { type NextRequest, NextResponse } from 'next/server'

import type { BaseErrorContext, ValidationErrorContext } from '@/types/error.types'

import { handleServerError as handleError } from '@/lib/error/server'
import { buildLogger } from '@/lib/logger/server'

const logger = buildLogger('api-error-handler')

/**
 * Standardized API error response format
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    context?: BaseErrorContext
    statusCode: number
  }
  timestamp?: string
}

/**
 * Handles errors in API routes and returns standardized error responses
 *
 * @param error - The error that occurred
 * @param request - The Next.js request object (optional, for context)
 * @param context - Additional context for error logging
 * @returns Standardized NextResponse with error details
 */
export function handleApiError(
  error: unknown,
  request?: NextRequest,
  context: Record<string, unknown> = {}
): NextResponse<ApiErrorResponse> {
  // Use the enhanced error handler to process the error
  const appError = handleError(error, {
    ...context,
    method: request?.method,
    url: request?.url,
    userAgent: request?.headers.get('user-agent') ?? undefined,
    clientIp: request?.headers.get('x-forwarded-for') ?? request?.headers.get('x-real-ip') ?? undefined,
  })

  // Log the error with context
  logger.error(
    {
      error: appError,
      statusCode: appError.statusCode,
      code: appError.code,
      method: request?.method,
      url: request?.url,
      ...context,
    },
    'API route error'
  )

  // Return standardized error response
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      context: appError.context,
      statusCode: appError.statusCode ?? 500,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(errorResponse, {
    status: appError.statusCode ?? 500,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * API route wrapper that automatically handles errors
 *
 * @param handler - The API route handler function
 * @returns Wrapped handler function with error handling
 */
export function withApiErrorHandler(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request)
    } catch (error) {
      return handleApiError(error, request, {
        handlerName: handler.name || 'anonymous',
      })
    }
  }
}

/**
 * Creates a successful API response with consistent format
 */
export function createApiSuccessResponse<T = unknown>(
  data: T,
  message?: string,
  statusCode: number = 200
): NextResponse<{
  success: true
  data: T
  message?: string
  timestamp: string
}> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

/**
 * Creates a validation error response
 */
export function createApiValidationErrorResponse(
  validationError: unknown,
  context: ValidationErrorContext = {}
): NextResponse<ApiErrorResponse> {
  const errorContext: ValidationErrorContext = {
    ...context,
    validationDetails: validationError,
  }

  const appError = handleError(validationError, errorContext)

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: 'Validation failed',
      context: appError.context,
      statusCode: 400,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(errorResponse, { status: 400 })
}

/**
 * Creates an unauthorized error response
 */
export function createApiUnauthorizedResponse(
  message: string = 'Unauthorized access',
  context: Record<string, unknown> = {}
): NextResponse<ApiErrorResponse> {
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: 'AUTH/UNAUTHORIZED',
      message,
      context,
      statusCode: 401,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(errorResponse, { status: 401 })
}

/**
 * Creates a not found error response
 */
export function createApiNotFoundResponse(
  resource: string = 'Resource',
  context: Record<string, unknown> = {}
): NextResponse<ApiErrorResponse> {
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: 'DATABASE/NOT_FOUND',
      message: `${resource} not found`,
      context,
      statusCode: 404,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(errorResponse, { status: 404 })
}
