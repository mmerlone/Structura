import pino, { LoggerOptions } from 'pino'
import type { Logger } from '@/types/logger.types'

const isProduction = process.env.NODE_ENV === 'production'

// Validate Datadog configuration
const datadogApiKey = process.env.DATADOG_API_KEY
const hasDatadogConfig = Boolean(datadogApiKey && datadogApiKey !== 'your_datadog_api_key')

const options: LoggerOptions = {
  level: isProduction ? 'info' : 'debug',
}

// Configure transports based on environment and available configuration
if (isProduction) {
  if (hasDatadogConfig) {
    // Production with Datadog: Send logs to Datadog
    options.transport = {
      targets: [
        {
          target: 'pino-datadog-transport',
          options: {
            apiKey: datadogApiKey,
            service: process.env.NEXT_PUBLIC_DATADOG_SERVICE || 'structura',
            hostname: process.env.HOSTNAME || 'unknown',
            env: process.env.NEXT_PUBLIC_DATADOG_ENV || 'production',
            version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
          },
          level: 'info',
        },
      ],
    }
    console.log('✅ Pino → Datadog transport enabled')
  } else {
    // Production without Datadog: JSON to stdout (for external log collectors)
    console.warn('⚠️  DATADOG_API_KEY not configured - logs will go to stdout only')
    console.warn('   Set DATADOG_API_KEY environment variable to enable Datadog log transport')
    // No transport specified = JSON to stdout
  }
} else {
  // Development: Pretty console output
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  }
}

export const logger: Logger = pino(options)

// Example of how to use child loggers with specific context
export const buildLogger = (moduleName: string): Logger => {
  return logger.child({ module: moduleName })
}
