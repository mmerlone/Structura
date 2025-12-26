/**
 * Datadog configuration management
 *
 * Centralizes Datadog configuration with environment-specific settings
 * and validation following the project's security configuration pattern.
 */

export type DatadogEnvironment = 'development' | 'staging' | 'production'

export interface DatadogConfig {
  applicationId: string
  clientToken: string
  site: string
  service: string
  env: DatadogEnvironment
  version?: string
  sessionSampleRate: number
  sessionReplaySampleRate: number
  defaultPrivacyLevel: 'allow' | 'mask' | 'mask-user-input'
  enabled: boolean
}

/**
 * Get Datadog configuration from environment variables
 */
export function getDatadogConfig(): DatadogConfig {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || ''
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || ''

  // Check for default/placeholder values
  const hasValidApplicationId = Boolean(
    applicationId && applicationId !== 'your_app_id' && applicationId !== '0903e4a4-5a20-4439-8ba7-43c4101dfbd9' // Sample from docs
  )

  const hasValidClientToken = Boolean(
    clientToken && clientToken !== 'your_client_token' && clientToken !== 'pub1229965fea4a6ca5f1bab5f8f34e5177' // Sample from docs
  )

  return {
    applicationId,
    clientToken,
    site: process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com',
    service: process.env.NEXT_PUBLIC_DATADOG_SERVICE || 'structura',
    env:
      (process.env.NEXT_PUBLIC_DATADOG_ENV as DatadogEnvironment) ||
      (isProduction ? 'production' : isDevelopment ? 'development' : 'staging'),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    // Sample rates - more aggressive in development, conservative in production
    sessionSampleRate: isDevelopment ? 100 : 10,
    sessionReplaySampleRate: isDevelopment ? 100 : 5,

    // Privacy level - mask user input by default
    defaultPrivacyLevel: 'mask-user-input',

    // Enable only if required env vars are present AND not default values
    enabled: hasValidApplicationId && hasValidClientToken,
  }
}

/**
 * Validate Datadog configuration
 * Follows the same pattern as SECURITY_CONFIG.validateSecurityConfig()
 */
export function validateDatadogConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const config = getDatadogConfig()

  // Check required fields and validate they're not default values
  if (!config.applicationId) {
    errors.push('Missing NEXT_PUBLIC_DATADOG_APPLICATION_ID')
  } else if (
    config.applicationId === 'your_app_id' ||
    config.applicationId === '0903e4a4-5a20-4439-8ba7-43c4101dfbd9'
  ) {
    errors.push(
      'NEXT_PUBLIC_DATADOG_APPLICATION_ID is set to default/sample value - please use your actual Application ID'
    )
  }

  if (!config.clientToken) {
    errors.push('Missing NEXT_PUBLIC_DATADOG_CLIENT_TOKEN')
  } else if (
    config.clientToken === 'your_client_token' ||
    config.clientToken === 'pub1229965fea4a6ca5f1bab5f8f34e5177'
  ) {
    errors.push('NEXT_PUBLIC_DATADOG_CLIENT_TOKEN is set to default/sample value - please use your actual Client Token')
  }

  // Validate site format
  if (config.site && !config.site.includes('datadoghq.')) {
    errors.push('Invalid NEXT_PUBLIC_DATADOG_SITE format')
  }

  // Validate sample rates
  if (config.sessionSampleRate < 0 || config.sessionSampleRate > 100) {
    errors.push('Session sample rate must be between 0 and 100')
  }

  if (config.sessionReplaySampleRate < 0 || config.sessionReplaySampleRate > 100) {
    errors.push('Session replay sample rate must be between 0 and 100')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
