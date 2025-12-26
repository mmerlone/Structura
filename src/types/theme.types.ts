import { ThemePreferenceEnum } from './enums'

export type ResolvedTheme = 'dark' | 'light'

/**
 * Type representing theme preference values.
 * Derived from ThemePreferenceEnum for type safety.
 */
export type ThemePreference = `${ThemePreferenceEnum}`
export { ThemePreferenceEnum }
