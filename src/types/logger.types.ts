import { LogLevelEnum } from './enums'

export type LogLevel = `${LogLevelEnum}`

export interface LoggerContext {
  [key: string]: unknown
}

export interface Logger {
  error: (context: LoggerContext, message: string) => void
  warn: (context: LoggerContext, message: string) => void
  info: (context: LoggerContext, message: string) => void
  debug: (context: LoggerContext, message: string) => void
  child: (context: LoggerContext) => Logger
}
