/**
 * Datadog integration module
 *
 * Provides centralized configuration and utilities for Datadog RUM.
 * Logs are handled by Pino → Datadog transport, not through RUM.
 */

// Client-side exports
export { initializeDatadog, isDatadogInitialized } from './client'
export { captureErrorToDatadog, trackDatadogEvent, addDatadogTiming } from './utils'

// Configuration exports
export type { DatadogConfig, DatadogEnvironment } from './config'
export { getDatadogConfig, validateDatadogConfig } from './config'

// Types
export type { DatadogErrorContext } from './datadog.types'
