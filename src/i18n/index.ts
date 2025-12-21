// Re-export all from config and settings
// Import and re-export the initialized i18n instance
import i18n from 'i18next'

import { initI18n } from './config'

export * from './settings'

// Export the i18n instance
export { i18n, initI18n }
export default i18n

// Re-export commonly used types
export type { TFunction, i18n as I18n } from 'i18next'
export type { Language, Namespace } from './settings'
