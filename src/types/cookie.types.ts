/**
 * Cookie preferences type definition.
 *
 * @remarks
 * This interface defines the structure for managing user cookie consent preferences
 * across the application. It serves as the single source of truth for all
 * cookie-related settings and should be used whenever cookie preferences need to be
 * accessed or modified.
 *
 * @example
 * ```typescript
 * const prefs: CookiePreferences = {
 *   necessary: true,  // Always true as these are essential
 *   analytics: true,  // User has opted into analytics
 *   marketing: false, // User has opted out of marketing
 *   functional: true  // User has enabled functional cookies
 * };
 * ```
 */
export interface CookiePreferences {
  /**
   * Whether necessary cookies are enabled.
   * @remarks
   * This is always `true` as these cookies are essential for the basic
   * functionality of the website and cannot be disabled.
   */
  necessary: boolean

  /**
   * Whether analytics cookies are enabled.
   * @remarks
   * When enabled, allows the collection of anonymous usage statistics
   * to help improve the application.
   */
  analytics: boolean

  /**
   * Whether marketing cookies are enabled.
   * @remarks
   * When enabled, allows tracking for personalized advertising and
   * marketing purposes.
   */
  marketing: boolean

  /**
   * Whether functional cookies are enabled.
   * @remarks
   * When enabled, allows enhanced functionality and personalization
   * across the application.
   */
  functional: boolean
}
