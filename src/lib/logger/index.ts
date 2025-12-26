/**
 * Logger module - explicit imports only
 * No auto-detection to avoid bundling issues
 */

// Export environment-specific loggers explicitly
export { logger as clientLogger, buildLogger as buildClientLogger } from './client'
export { logger as serverLogger, buildLogger as buildServerLogger } from './server'

// Environment detection helpers (for manual use)
export const isClient = (): boolean => typeof window !== 'undefined'
export const isServer = (): boolean => typeof window === 'undefined'

// Export types
export type { Logger, LoggerContext } from '@/types/logger.types'

// Note: No default logger export to prevent auto-detection issues
