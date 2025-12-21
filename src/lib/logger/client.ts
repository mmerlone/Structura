/**
 * Client-side logger that mirrors the pino API but uses console
 * Only logs in development environment
 */

import { LogLevelEnum } from '@/types/enums'
import type { Logger, LoggerContext, LogLevel } from '@/types/logger.types'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Create a no-op logger for production
const createNoOpLogger = (): Logger => ({
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
  child: () => createNoOpLogger(),
})

// Create console-based logger for development
const createConsoleLogger = (baseContext: LoggerContext = {}): Logger => {
  const log = (level: LogLevel, context: LoggerContext, message: string): void => {
    if (!isDevelopment) return

    const mergedContext = { ...baseContext, ...context }
    const timestamp = new Date().toISOString()

    // Format the output similar to pino-pretty
    const formattedContext = Object.keys(mergedContext)
      .sort()
      .map((key) => `${key}=${JSON.stringify(mergedContext[key])}`)
      .join(' ')

    const logMessage = `[${timestamp}] ${level} ${message} ${formattedContext}`

    switch (level) {
      case LogLevelEnum.ERROR:
        console.error(logMessage)
        break
      case LogLevelEnum.WARN:
        console.warn(logMessage)
        break
      case LogLevelEnum.INFO:
        console.info(logMessage)
        break
      case LogLevelEnum.DEBUG:
        console.debug(logMessage)
        break
    }
  }

  return {
    error: (context: LoggerContext, message: string) => log(LogLevelEnum.ERROR, context, message),
    warn: (context: LoggerContext, message: string) => log(LogLevelEnum.WARN, context, message),
    info: (context: LoggerContext, message: string) => log(LogLevelEnum.INFO, context, message),
    debug: (context: LoggerContext, message: string) => log(LogLevelEnum.DEBUG, context, message),
    child: (context: LoggerContext) => createConsoleLogger({ ...baseContext, ...context }),
  }
}

// Export the appropriate logger based on environment
export const logger: Logger = isDevelopment ? createConsoleLogger() : createNoOpLogger()

// Example of how to use child loggers with specific context
export const buildLogger = (moduleName: string): Logger => {
  return logger.child({ module: moduleName })
}
