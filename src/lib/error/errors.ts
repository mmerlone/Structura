import { ErrorCodes } from './codes'
import { ErrorTypeEnum } from '@/types/enums'
import type {
  AppError,
  AppErrorOptions,
  AuthErrorContext,
  DatabaseErrorContext,
  ValidationErrorContext,
  NetworkErrorContext,
  BaseErrorContext,
  AppErrorJSON,
  ErrorType,
} from '@/types/error.types'

/**
 * Base AppError implementation
 */
export class BaseAppError<TContext extends BaseErrorContext = BaseErrorContext>
  extends Error
  implements AppError<TContext>
{
  public readonly code: string
  public readonly context: TContext
  public readonly isOperational!: boolean
  public readonly statusCode?: number
  public override readonly cause?: Error | AppError | null
  public readonly errorType: ErrorType

  constructor(options: AppErrorOptions<TContext>) {
    super(options.message)
    this.errorType = ErrorTypeEnum.APP_ERROR as ErrorType
    this.code = options.code
    this.context = (options.context || {}) as TContext
    this.isOperational = options.isOperational ?? true
    this.statusCode = options.statusCode
    this.cause = options.cause

    Error.captureStackTrace?.(this, this.constructor)
  }

  toJSON(): AppErrorJSON<TContext> {
    return {
      code: this.code,
      message: this.message,
      ...(Object.keys(this.context).length > 0 && { context: this.context }),
      ...(this.statusCode !== null && { statusCode: this.statusCode }),
      isOperational: this.isOperational,
      errorType: this.errorType,
      ...(this.stack !== null && { stack: this.stack }),
    }
  }
}

/**
 * Authentication-related errors
 * Used for login, registration, session management, and authorization issues
 */
export class AuthError extends BaseAppError<AuthErrorContext> {
  constructor(options: Omit<AppErrorOptions<AuthErrorContext>, 'isOperational'>) {
    super({ ...options, isOperational: true })
    Object.defineProperty(this, 'errorType', {
      value: ErrorTypeEnum.AUTH_ERROR as ErrorType,
      writable: false,
      enumerable: true,
      configurable: false,
    })
  }
}

/**
 * Validation errors for user input and form data
 * Used when user input doesn't meet required constraints or formats
 */
export class ValidationError extends BaseAppError<ValidationErrorContext> {
  constructor(message: string, context?: ValidationErrorContext) {
    super({
      code: ErrorCodes.validation.invalidInput(),
      message,
      context: context || {},
      isOperational: true,
      statusCode: 400,
    })
    Object.defineProperty(this, 'errorType', {
      value: ErrorTypeEnum.VALIDATION_ERROR as ErrorType,
      writable: false,
      enumerable: true,
      configurable: false,
    })
  }
}

/**
 * Database operation errors
 * Used for connection issues, query failures, and data integrity problems
 */
export class DatabaseError extends BaseAppError<DatabaseErrorContext> {
  constructor(options: Omit<AppErrorOptions<DatabaseErrorContext>, 'isOperational'>) {
    super({ ...options, isOperational: false })
    Object.defineProperty(this, 'errorType', {
      value: ErrorTypeEnum.DATABASE_ERROR as ErrorType,
      writable: false,
      enumerable: true,
      configurable: false,
    })
  }
}

/**
 * Network and API communication errors
 * Used for HTTP request failures, timeout issues, and external service problems
 */
export class NetworkError extends BaseAppError<NetworkErrorContext> {
  constructor(options: Omit<AppErrorOptions<NetworkErrorContext>, 'isOperational'>) {
    super({ ...options, isOperational: true })
    Object.defineProperty(this, 'errorType', {
      value: ErrorTypeEnum.NETWORK_ERROR as ErrorType,
      writable: false,
      enumerable: true,
      configurable: false,
    })
  }
}

/**
 * Permission and authorization errors
 * Used when user lacks required permissions or access rights
 */
export class PermissionError extends BaseAppError<BaseErrorContext> {
  constructor(options: Omit<AppErrorOptions<BaseErrorContext>, 'isOperational'>) {
    super({ ...options, isOperational: true })
    Object.defineProperty(this, 'errorType', {
      value: ErrorTypeEnum.PERMISSION_ERROR as ErrorType,
      writable: false,
      enumerable: true,
      configurable: false,
    })
  }
}

/**
 * Configuration errors
 * Used for missing or invalid environment variables, configuration files, etc.
 */
export class ConfigurationError extends BaseAppError<BaseErrorContext> {
  constructor(options: Omit<AppErrorOptions<BaseErrorContext>, 'isOperational'>) {
    super({ ...options, isOperational: false })
    Object.defineProperty(this, 'errorType', {
      value: ErrorTypeEnum.CONFIGURATION_ERROR as ErrorType,
      writable: false,
      enumerable: true,
      configurable: false,
    })
  }
}

/**
 * Business logic errors
 * Used for application-specific business rule violations
 */
export class BusinessError extends BaseAppError<BaseErrorContext> {
  constructor(options: Omit<AppErrorOptions<BaseErrorContext>, 'isOperational'>) {
    super({ ...options, isOperational: true })
    Object.defineProperty(this, 'errorType', {
      value: ErrorTypeEnum.BUSINESS_ERROR as ErrorType,
      writable: false,
      enumerable: true,
      configurable: false,
    })
  }
}
