import {
  ErrorDomainEnum,
  AuthErrorCodeEnum,
  ValidationErrorCodeEnum,
  DatabaseErrorCodeEnum,
  NetworkErrorCodeEnum,
  ServerErrorCodeEnum,
} from '@/types/enums'

/**
 * Error code structure following DOMAIN/TYPE_DESCRIPTION format
 */
export interface ErrorCodeStructure {
  domain: ErrorDomainEnum
  type: string
  description: string
}

/**
 * Error message mapping with strong typing
 */
export interface ErrorMessageMap {
  readonly [key: string]: string
}

/**
 * Authentication error messages
 */
export const AUTH_ERROR_MESSAGES: ErrorMessageMap = {
  [`${ErrorDomainEnum.AUTH}/${AuthErrorCodeEnum.INVALID_CREDENTIALS}`]: 'Invalid email or password',
  [`${ErrorDomainEnum.AUTH}/${AuthErrorCodeEnum.EMAIL_NOT_CONFIRMED}`]: 'Please verify your email before logging in',
  [`${ErrorDomainEnum.AUTH}/${AuthErrorCodeEnum.SESSION_EXPIRED}`]: 'Your session has expired. Please log in again',
  [`${ErrorDomainEnum.AUTH}/${AuthErrorCodeEnum.USER_NOT_FOUND}`]: 'User account not found',
  [`${ErrorDomainEnum.AUTH}/${AuthErrorCodeEnum.WEAK_PASSWORD}`]: 'Password does not meet security requirements',
  [`${ErrorDomainEnum.AUTH}/${AuthErrorCodeEnum.EMAIL_ALREADY_IN_USE}`]: 'This email is already registered',
  [`${ErrorDomainEnum.AUTH}/${AuthErrorCodeEnum.INVALID_TOKEN}`]: 'Invalid or expired authentication token',
  [`${ErrorDomainEnum.AUTH}/${AuthErrorCodeEnum.UNKNOWN_SUPABASE_ERROR}`]: 'Authentication service error',
}

/**
 * Validation error messages
 */
export const VALIDATION_ERROR_MESSAGES: ErrorMessageMap = {
  [`${ErrorDomainEnum.VALIDATION}/${ValidationErrorCodeEnum.INVALID_INPUT}`]: 'Invalid input provided',
  [`${ErrorDomainEnum.VALIDATION}/${ValidationErrorCodeEnum.DUPLICATE_ENTRY}`]: 'This record already exists',
  [`${ErrorDomainEnum.VALIDATION}/${ValidationErrorCodeEnum.CONSTRAINT_VIOLATION}`]: 'Data validation failed',
  [`${ErrorDomainEnum.VALIDATION}/${ValidationErrorCodeEnum.FOREIGN_KEY_VIOLATION}`]:
    'Referenced record does not exist',
  [`${ErrorDomainEnum.VALIDATION}/${ValidationErrorCodeEnum.NOT_NULL_VIOLATION}`]: 'Required field is missing',
}

/**
 * Database error messages
 */
export const DATABASE_ERROR_MESSAGES: ErrorMessageMap = {
  [`${ErrorDomainEnum.DATABASE}/${DatabaseErrorCodeEnum.NOT_FOUND}`]: 'Record not found',
  [`${ErrorDomainEnum.DATABASE}/${DatabaseErrorCodeEnum.RELATION_NOT_FOUND}`]: 'Data table not found',
  [`${ErrorDomainEnum.DATABASE}/${DatabaseErrorCodeEnum.NO_CONTENT}`]: 'No data available',
  [`${ErrorDomainEnum.DATABASE}/${DatabaseErrorCodeEnum.UNKNOWN_POSTGREST_ERROR}`]: 'Database operation failed',
  [`${ErrorDomainEnum.DATABASE}/${DatabaseErrorCodeEnum.UNKNOWN_ERROR}`]: 'Database operation failed',
}

/**
 * Network error messages
 */
export const NETWORK_ERROR_MESSAGES: ErrorMessageMap = {
  [`${ErrorDomainEnum.NETWORK}/${NetworkErrorCodeEnum.CONNECTION_ERROR}`]: 'Network connection failed',
  [`${ErrorDomainEnum.NETWORK}/${NetworkErrorCodeEnum.TIMEOUT}`]: 'Request timed out',
  [`${ErrorDomainEnum.NETWORK}/${NetworkErrorCodeEnum.RATE_LIMIT_EXCEEDED}`]:
    'Too many requests. Please try again later',
}

/**
 * Server error messages
 */
export const SERVER_ERROR_MESSAGES: ErrorMessageMap = {
  [`${ErrorDomainEnum.SERVER}/${ServerErrorCodeEnum.UNKNOWN_ERROR}`]: 'An unexpected error occurred',
  [`${ErrorDomainEnum.SERVER}/${ServerErrorCodeEnum.INTERNAL_ERROR}`]: 'Internal server error',
}

/**
 * Combined error message map
 */
export const ERROR_MESSAGES: ErrorMessageMap = {
  ...AUTH_ERROR_MESSAGES,
  ...VALIDATION_ERROR_MESSAGES,
  ...DATABASE_ERROR_MESSAGES,
  ...NETWORK_ERROR_MESSAGES,
  ...SERVER_ERROR_MESSAGES,
}

/**
 * Utility class for creating structured error codes
 */
export class ErrorCodeBuilder {
  /**
   * Create an error code in the format DOMAIN/TYPE_DESCRIPTION
   */
  static create(domain: ErrorDomainEnum, type: string): string {
    return `${domain}/${type}`
  }

  /**
   * Parse an error code into its components
   */
  static parse(errorCode: string): ErrorCodeStructure | null {
    const parts = errorCode.split('/')
    if (parts.length !== 2) return null

    const [domain, description] = parts

    // Validate domain
    if (!Object.values(ErrorDomainEnum).includes(domain as ErrorDomainEnum)) {
      return null
    }

    return {
      domain: domain as ErrorDomainEnum,
      type: domain ?? '',
      description: description ?? '',
    }
  }

  /**
   * Get error message for a given error code
   */
  static getMessage(errorCode: string): string {
    return ERROR_MESSAGES[errorCode] ?? 'An error occurred'
  }

  /**
   * Check if an error code belongs to a specific domain
   */
  static isDomain(errorCode: string, domain: ErrorDomainEnum): boolean {
    return errorCode.startsWith(`${domain}/`)
  }
}

/**
 * Helper functions for creating specific error codes
 */
export const ErrorCodes = {
  auth: {
    invalidCredentials: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.AUTH, AuthErrorCodeEnum.INVALID_CREDENTIALS),
    emailNotConfirmed: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.AUTH, AuthErrorCodeEnum.EMAIL_NOT_CONFIRMED),
    sessionExpired: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.AUTH, AuthErrorCodeEnum.SESSION_EXPIRED),
    userNotFound: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.AUTH, AuthErrorCodeEnum.USER_NOT_FOUND),
    weakPassword: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.AUTH, AuthErrorCodeEnum.WEAK_PASSWORD),
    emailAlreadyInUse: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.AUTH, AuthErrorCodeEnum.EMAIL_ALREADY_IN_USE),
    invalidToken: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.AUTH, AuthErrorCodeEnum.INVALID_TOKEN),
    unknownError: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.AUTH, AuthErrorCodeEnum.UNKNOWN_SUPABASE_ERROR),
  },
  validation: {
    invalidInput: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.VALIDATION, ValidationErrorCodeEnum.INVALID_INPUT),
    duplicateEntry: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.VALIDATION, ValidationErrorCodeEnum.DUPLICATE_ENTRY),
    constraintViolation: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.VALIDATION, ValidationErrorCodeEnum.CONSTRAINT_VIOLATION),
    foreignKeyViolation: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.VALIDATION, ValidationErrorCodeEnum.FOREIGN_KEY_VIOLATION),
    notNullViolation: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.VALIDATION, ValidationErrorCodeEnum.NOT_NULL_VIOLATION),
  },
  database: {
    notFound: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.DATABASE, DatabaseErrorCodeEnum.NOT_FOUND),
    relationNotFound: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.DATABASE, DatabaseErrorCodeEnum.RELATION_NOT_FOUND),
    noContent: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.DATABASE, DatabaseErrorCodeEnum.NO_CONTENT),
    unknownPostgrestError: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.DATABASE, DatabaseErrorCodeEnum.UNKNOWN_POSTGREST_ERROR),
    unknownError: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.DATABASE, DatabaseErrorCodeEnum.UNKNOWN_ERROR),
  },
  network: {
    connectionError: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.NETWORK, NetworkErrorCodeEnum.CONNECTION_ERROR),
    timeout: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.NETWORK, NetworkErrorCodeEnum.TIMEOUT),
    rateLimitExceeded: (): string =>
      ErrorCodeBuilder.create(ErrorDomainEnum.NETWORK, NetworkErrorCodeEnum.RATE_LIMIT_EXCEEDED),
  },
  server: {
    unknownError: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.SERVER, ServerErrorCodeEnum.UNKNOWN_ERROR),
    internalError: (): string => ErrorCodeBuilder.create(ErrorDomainEnum.SERVER, ServerErrorCodeEnum.INTERNAL_ERROR),
  },
}
