/**
 * Standard log levels for consistent logging across the application.
 * Maps to Pino's log levels. Only includes levels actually used.
 */
export enum LogLevelEnum {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Theme options for user interface theming preferences.
 * Defines the available theme modes that can be applied to the application.
 */
export enum ThemePreferenceEnum {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

/**
 * Authentication operations used in the application.
 * Defines the different types of authentication forms and flows.
 */
export enum AuthOperationsEnum {
  // Standard authentication
  LOGIN = 'login',
  REGISTER = 'register',

  // Password reset flow (two-step)
  FORGOT_PASSWORD = 'forgot-password', // Step 1: Request password reset (email only)
  RESET_PASSWORD = 'reset-password', // Step 2: Set new password (password fields)

  // Account management
  UPDATE_PASSWORD = 'update-password', // For logged-in users to change their password
}

/**
 * Authentication providers supported by the application.
 *
 * @remarks
 * This enum defines the authentication providers that can be used for user authentication.
 * Each provider corresponds to an OAuth 2.0 or OpenID Connect identity provider.
 *
 * @example
 * ```typescript
 * // Using the AuthProviders enum
 * const provider: AuthProviders = AuthProvider.GOOGLE;
 *
 * // Checking provider type
 * if (provider === AuthProviders.GOOGLE) {
 *   // Handle Google authentication
 * }
 * ```
 */
export enum AuthProvidersEnum {
  /**
   * Google OAuth 2.0 provider.
   *
   * @remarks
   * Requires Google OAuth 2.0 credentials to be configured.
   *
   * @see [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
   */
  GOOGLE = 'google',

  /**
   * GitHub OAuth 2.0 provider.
   *
   * @remarks
   * Requires GitHub OAuth App to be configured.
   *
   * @see [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
   */
  GITHUB = 'github',

  /**
   * Microsoft OAuth 2.0 provider.
   *
   * @remarks
   * Requires Microsoft Identity Platform application to be configured.
   *
   * @see [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
   */
  MICROSOFT = 'microsoft',

  /**
   * Apple Sign In provider.
   *
   * @remarks
   * Requires Apple Developer account and Sign In with Apple configuration.
   *
   */
  APPLE = 'apple',
}

/**
 * Sign out reasons
 */
export enum SignOutReasonEnum {
  USER_ACTION = 'user_action',
  USER_NOT_FOUND = 'user_not_found',
  SESSION_EXPIRED = 'session_expired',
  UNKNOWN = 'unknown',
}

export enum GenderPreferenceEnum {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non-binary',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer-not-to-say',
}

export enum NotificationPreferencesEnum {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

/**
 * Profile controller operations for type safety
 * Defines the different operations that can be performed on user profiles
 */
export enum ProfileOperationEnum {
  LOAD = 'loadProfile',
  UPDATE = 'updateProfile',
  UPLOAD = 'uploadAvatar',
  CREATE_IF_MISSING = 'createProfileIfMissing',
}

/**
 * Error domains for structured error codes.
 * Defines the high-level categories of errors.
 */
export enum ErrorDomainEnum {
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  PERMISSION = 'PERMISSION',
  CONFIGURATION = 'CONFIGURATION',
  BUSINESS = 'BUSINESS',
}

/**
 * Error types for structured error handling.
 * Defines the different categories of errors that can occur in the application.
 */
export enum ErrorTypeEnum {
  APP_ERROR = 'AppError',
  AUTH_ERROR = 'AuthError',
  VALIDATION_ERROR = 'ValidationError',
  DATABASE_ERROR = 'DatabaseError',
  NETWORK_ERROR = 'NetworkError',
  PERMISSION_ERROR = 'PermissionError',
  CONFIGURATION_ERROR = 'ConfigurationError',
  BUSINESS_ERROR = 'BusinessError',
  SERVER_ERROR = 'ServerError',
}

/**
 * Authentication error codes.
 * Format: AUTH/SPECIFIC_ERROR
 */
export enum AuthErrorCodeEnum {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMAIL_ALREADY_IN_USE = 'EMAIL_ALREADY_IN_USE',
  INVALID_TOKEN = 'INVALID_TOKEN',
  UNKNOWN_SUPABASE_ERROR = 'UNKNOWN_SUPABASE_ERROR',
}

/**
 * Authentication error types for categorizing different auth issues.
 */
export enum AuthErrorTypeEnum {
  REFRESH_TOKEN = 'refresh_token',
  ACCESS_TOKEN = 'access_token',
  SESSION = 'session',
  CREDENTIALS = 'credentials',
  VERIFICATION = 'verification',
}

/**
 * Validation error codes.
 * Format: VALIDATION/SPECIFIC_ERROR
 */
export enum ValidationErrorCodeEnum {
  INVALID_INPUT = 'INVALID_INPUT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  NOT_NULL_VIOLATION = 'NOT_NULL_VIOLATION',
}

/**
 * Database error codes.
 * Format: DATABASE/SPECIFIC_ERROR
 */
export enum DatabaseErrorCodeEnum {
  NOT_FOUND = 'NOT_FOUND',
  RELATION_NOT_FOUND = 'RELATION_NOT_FOUND',
  NO_CONTENT = 'NO_CONTENT',
  UNKNOWN_POSTGREST_ERROR = 'UNKNOWN_POSTGREST_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Network error codes.
 * Format: NETWORK/SPECIFIC_ERROR
 */
export enum NetworkErrorCodeEnum {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Server error codes.
 * Format: SERVER/SPECIFIC_ERROR
 */
export enum ServerErrorCodeEnum {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Union type that includes all enum values from this module.
 *
 * @remarks
 * This type is a convenience type that combines all enum values
 * for use in functions that might accept any of these types.
 *
 * @example
 * ```typescript
 * import { clientLogger } from '@/lib/logger'
 *
 * function logEnumValue(value: AllEnumValues) {
 *   clientLogger.info({ enumValue: value }, 'Logging enum value')
 * }
 *
 * logEnumValue(ThemePreference.DARK); // OK
 * ```
 *
 * @note For authentication events, import AuthChangeEvent from @supabase/supabase-js
 * @example
 * ```typescript
 * import type { AuthChangeEvent } from '@supabase/supabase-js'
 * import { clientLogger } from '@/lib/logger'
 *
 * // Listening for auth state changes
 * supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
 *   if (event === 'SIGNED_IN') {
 *     clientLogger.info({ userId: session.user.id }, 'User signed in')
 *   } else if (event === 'SIGNED_OUT') {
 *     clientLogger.info({}, 'User signed out')
 *   }
 * });
 * ```
 */
export type AllEnumValues =
  | ThemePreferenceEnum
  | AuthProvidersEnum
  | AuthOperationsEnum
  | SignOutReasonEnum
  | GenderPreferenceEnum
  | NotificationPreferencesEnum
  | ProfileOperationEnum
  | ErrorDomainEnum
  | ErrorTypeEnum
  | AuthErrorCodeEnum
  | AuthErrorTypeEnum
  | ValidationErrorCodeEnum
  | DatabaseErrorCodeEnum
  | NetworkErrorCodeEnum
  | ServerErrorCodeEnum
