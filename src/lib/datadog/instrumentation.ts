/**
 * Datadog instrumentation setup
 *
 * Provides initialization function to be called in the root layout.
 * Follows the same pattern as the Sentry instrumentation.
 */

'use client'

import { initializeDatadog } from './client'

/**
 * Initialize Datadog RUM instrumentation
 * Should be called once in the root layout component
 */
export function initializeDatadogInstrumentation(): void {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return
  }

  // Initialize Datadog RUM
  const initialized = initializeDatadog()

  if (!initialized && process.env.NODE_ENV === 'development') {
    console.warn('Datadog RUM initialization skipped - check configuration')
  }
}

/**
 * Export initialization function for use in layout
 */
export { initializeDatadog as initDatadog } from './client'
export { setDatadogUser, clearDatadogUser, addDatadogGlobalContext } from './client'
