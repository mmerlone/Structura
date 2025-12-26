/**
 * Datadog client-side initialization
 *
 * Handles browser-side Datadog RUM initialization with React integration.
 * Follows the project's pattern of client-side instrumentation.
 */

'use client'

import { datadogRum } from '@datadog/browser-rum'
import { reactPlugin } from '@datadog/browser-rum-react'
import { getDatadogConfig, validateDatadogConfig } from './config'
import type { DatadogUserContext } from './datadog.types'

let isInitialized = false

/**
 * Initialize Datadog RUM
 * Should be called once in the root layout or app component
 */
export function initializeDatadog(): boolean {
  // Prevent double initialization
  if (isInitialized) {
    return true
  }

  const config = getDatadogConfig()

  // Skip initialization if not enabled or missing config
  if (!config.enabled) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Datadog RUM not initialized: missing or invalid configuration')
      console.warn('   Set NEXT_PUBLIC_DATADOG_APPLICATION_ID and NEXT_PUBLIC_DATADOG_CLIENT_TOKEN')
    }
    return false
  }

  // Validate configuration
  const validation = validateDatadogConfig()
  if (!validation.isValid) {
    console.error('❌ Datadog configuration errors:', validation.errors)
    return false
  }

  try {
    datadogRum.init({
      applicationId: config.applicationId,
      clientToken: config.clientToken,
      site: config.site,
      service: config.service,
      env: config.env,
      version: config.version,
      sessionSampleRate: config.sessionSampleRate,
      sessionReplaySampleRate: config.sessionReplaySampleRate,
      defaultPrivacyLevel: config.defaultPrivacyLevel,
      plugins: [
        reactPlugin({
          router: true,
        }),
      ],
      // Additional configuration for better integration
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
    })

    isInitialized = true

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Datadog RUM initialized successfully', {
        service: config.service,
        env: config.env,
        version: config.version,
      })
    }

    return true
  } catch (error) {
    console.error('❌ Failed to initialize Datadog RUM:', error)
    return false
  }
}

/**
 * Check if Datadog is initialized
 */
export function isDatadogInitialized(): boolean {
  return isInitialized
}

/**
 * Set user context for Datadog RUM
 * Should be called after user authentication
 */
export function setDatadogUser(user: DatadogUserContext): void {
  if (!isInitialized) {
    return
  }

  try {
    datadogRum.setUser(user)
  } catch (error) {
    console.error('Failed to set Datadog user context:', error)
  }
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearDatadogUser(): void {
  if (!isInitialized) {
    return
  }

  try {
    datadogRum.clearUser()
  } catch (error) {
    console.error('Failed to clear Datadog user context:', error)
  }
}

/**
 * Add global context to all RUM events
 */
export function addDatadogGlobalContext(context: Record<string, string | number | boolean>): void {
  if (!isInitialized) {
    return
  }

  try {
    datadogRum.setGlobalContext(context)
  } catch (error) {
    console.error('Failed to add Datadog global context:', error)
  }
}

/**
 * Start a custom user action
 * Useful for tracking business-specific actions
 */
export function startDatadogAction(name: string, context?: Record<string, unknown>): void {
  if (!isInitialized) {
    return
  }

  try {
    datadogRum.addAction(name, context)
  } catch (error) {
    console.error('Failed to start Datadog user action:', error)
  }
}
