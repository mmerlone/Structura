/**
 * Datadog RUM utility functions
 *
 * Provides helper functions for RUM events and user tracking that complement
 * the existing logger system (which sends logs directly to Datadog via transport).
 */

'use client'

import { datadogRum } from '@datadog/browser-rum'
import type { AppError } from '@/types/error.types'
import type { DatadogErrorContext } from './datadog.types'
import { isDatadogInitialized } from './client'

/**
 * Capture an error to Datadog RUM (for session context, not logging)
 * Logs should go through Pino → Datadog transport instead
 */
export function captureErrorToDatadog(error: Error | AppError | unknown, context: DatadogErrorContext = {}): void {
  if (!isDatadogInitialized()) {
    return
  }

  try {
    // Prepare error context for RUM
    const errorContext: DatadogErrorContext = {
      ...context,
      timestamp: new Date().toISOString(),
    }

    // Add AppError-specific context if available
    if (error && typeof error === 'object' && 'code' in error) {
      const appError = error as AppError
      errorContext.errorCode = appError.code
      errorContext.statusCode = appError.statusCode
      errorContext.isOperational = appError.isOperational

      // Add AppError context if available
      if (appError.context) {
        Object.assign(errorContext, appError.context)
      }
    }

    // Add error details
    if (error instanceof Error) {
      errorContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } else {
      errorContext.error = error
    }

    datadogRum.addError(error, errorContext)
  } catch (captureError) {
    console.error('Failed to capture error to Datadog:', captureError)
  }
}

/**
 * Add timing information to Datadog RUM
 * Useful for performance monitoring
 */
export function addDatadogTiming(name: string, duration: number): void {
  if (!isDatadogInitialized()) {
    return
  }

  try {
    datadogRum.addTiming(name, duration)
  } catch (error) {
    console.error('Failed to add timing to Datadog:', error)
  }
}

/**
 * Track a custom business event in Datadog RUM
 * Useful for tracking user actions and business metrics
 */
export function trackDatadogEvent(name: string, context?: Record<string, unknown>): void {
  if (!isDatadogInitialized()) {
    return
  }

  try {
    const eventContext = {
      ...context,
      timestamp: new Date().toISOString(),
    }

    datadogRum.addAction(name, eventContext)
  } catch (error) {
    console.error('Failed to track event to Datadog:', error)
  }
}

/**
 * Helper to safely extract error information
 * Follows the same pattern as the existing error utilities
 */
export function extractErrorInfo(error: unknown): {
  name: string
  message: string
  stack?: string
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return {
      name: 'UnknownError',
      message: String(error.message),
    }
  }

  return {
    name: 'UnknownError',
    message: String(error),
  }
}
