/**
 * Datadog type definitions
 */

export type DatadogLogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface DatadogLogContext {
  [key: string]: unknown
}

export interface DatadogErrorContext extends DatadogLogContext {
  error?: Error | unknown
  errorCode?: string
  statusCode?: number
  isOperational?: boolean
  componentStack?: string
}

export interface DatadogUserContext {
  id?: string
  email?: string
  name?: string
  [key: string]: unknown
}

export interface DatadogActionContext {
  type: string
  name: string
  context?: Record<string, unknown>
}
