import { Json } from '../../types/supabase'

import { DEFAULT_COOKIE_PREFERENCES } from './cookie-utils'

import type { DbProfile, DbProfileInsert, DbProfileUpdate } from '@/types/database'
import { GenderPreferenceEnum, NotificationPreferencesEnum } from '@/types/enums'
import type {
  GenderPreference,
  NotificationPreferences,
  PrivacySettings,
  Profile,
  ProfileUpdate,
  SocialLink,
  SocialLinks,
} from '@/types/profile.types'

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  cookie_preferences: DEFAULT_COOKIE_PREFERENCES,
  data_sharing: {
    third_parties: false,
    analytics: false,
    marketing: false,
  },
  communication_preferences: {
    email: true,
    push: false,
    sms: false,
  },
}

/**
 * Converts database privacy settings to application privacy settings
 */
const convertDbPrivacySettings = (privacySettings?: unknown): PrivacySettings => {
  if (privacySettings === null || typeof privacySettings !== 'object') {
    return DEFAULT_PRIVACY_SETTINGS
  }

  const settings = privacySettings as unknown as Partial<PrivacySettings>

  return {
    cookie_preferences: settings.cookie_preferences || DEFAULT_COOKIE_PREFERENCES,
    data_sharing: {
      third_parties: settings.data_sharing?.third_parties ?? false,
      analytics: settings.data_sharing?.analytics ?? false,
      marketing: settings.data_sharing?.marketing ?? false,
    },
    communication_preferences: {
      email: settings.communication_preferences?.email ?? true,
      push: settings.communication_preferences?.push ?? false,
      sms: settings.communication_preferences?.sms ?? false,
    },
  }
}

/**
 * Converts database gender preference to application gender preference
 */
const convertDbGenderPreference = (gender?: string | null): GenderPreference | null => {
  if (gender === null || gender === undefined) return null

  // Validate against enum values
  const validGenders = Object.values(GenderPreferenceEnum) as string[]
  return validGenders.includes(gender) ? (gender as GenderPreference) : null
}

/**
 * Converts database notification preferences to application notification preferences
 */
const convertDbNotificationPreferences = (prefs?: unknown): NotificationPreferences | null => {
  if (prefs === null || prefs === undefined) return null

  if (typeof prefs === 'string') {
    const validPrefs = Object.values(NotificationPreferencesEnum) as string[]
    return validPrefs.includes(prefs) ? (prefs as NotificationPreferences) : null
  }

  return null
}

/**
 * Converts database social links to application social links
 */
const convertDbSocialLinks = (links?: unknown): SocialLinks => {
  if (!Array.isArray(links)) return []

  return links.reduce<SocialLink[]>((acc, item) => {
    if (item !== null && typeof item === 'object' && 'id' in item && 'url' in item && 'title' in item) {
      const link = item as { id: unknown; url: unknown; title: unknown }
      if (typeof link.id === 'string' && typeof link.url === 'string' && typeof link.title === 'string') {
        acc.push({
          id: link.id,
          url: link.url,
          title: link.title,
        })
      }
    }
    return acc
  }, [])
}

/**
 * Converts a database profile to an application profile
 */
export const convertDbProfile = (dbProfile: DbProfile): Profile => {
  const {
    privacy_settings: dbPrivacySettings,
    gender: dbGender,
    notification_preferences: dbNotificationPrefs,
    social_links: dbSocialLinks,
    ...rest
  } = dbProfile

  return {
    ...rest,
    privacy_settings: convertDbPrivacySettings(dbPrivacySettings),
    gender: convertDbGenderPreference(dbGender),
    notification_preferences: convertDbNotificationPreferences(dbNotificationPrefs),
    social_links: convertDbSocialLinks(dbSocialLinks),
  }
}

/**
 * Converts application privacy settings to database privacy settings
 */
const convertAppPrivacySettings = (privacySettings?: PrivacySettings | null): Json | null => {
  if (!privacySettings) return JSON.stringify(DEFAULT_PRIVACY_SETTINGS)
  return JSON.stringify(privacySettings)
}

/**
 * Converts application gender preference to database gender preference
 */
const convertAppGenderPreference = (gender?: GenderPreference | null): string | null => {
  if (!gender) return null

  // Validate against enum values
  const validGenders = Object.values(GenderPreferenceEnum) as string[]
  return validGenders.includes(gender) ? gender : null
}

/**
 * Converts application notification preferences to database notification preferences
 */
const convertAppNotificationPreferences = (prefs?: NotificationPreferences | null): string | null => {
  if (!prefs) return null

  const validPrefs = Object.values(NotificationPreferencesEnum) as string[]
  return validPrefs.includes(prefs) ? prefs : null
}

/**
 * Converts application social links to database social links
 */
const convertAppSocialLinks = (links: SocialLinks): Array<{ id: string; url: string; title: string }> => {
  if (!Array.isArray(links)) return []

  return links.map((link) => ({
    id: link.id,
    url: link.url,
    title: link.title,
  }))
}

/**
 * Converts an application profile to a database profile for insert operations
 * Handles partial data by providing defaults for missing fields
 */
export const convertAppProfileForInsert = (appProfile: Partial<Profile>): DbProfileInsert => {
  const { privacy_settings, gender, notification_preferences, social_links, display_name, email, ...rest } = appProfile

  return {
    ...rest,
    display_name: display_name ?? '', // Required field with default
    email: email ?? '', // Required field with default
    privacy_settings: convertAppPrivacySettings(privacy_settings),
    gender: convertAppGenderPreference(gender),
    notification_preferences: convertAppNotificationPreferences(notification_preferences),
    social_links: convertAppSocialLinks(social_links || []),
  }
}

/**
 * Converts an application profile to a database profile for update operations
 * All fields are optional for partial updates
 */
export const convertAppProfileForUpdate = (appProfile: Partial<ProfileUpdate>): DbProfileUpdate => {
  const { privacy_settings, gender, notification_preferences, social_links, display_name, email, ...rest } = appProfile

  return {
    ...rest,
    display_name, // Optional field
    email, // Optional field
    privacy_settings: privacy_settings ? convertAppPrivacySettings(privacy_settings) : undefined,
    gender: convertAppGenderPreference(gender),
    notification_preferences: notification_preferences
      ? convertAppNotificationPreferences(notification_preferences)
      : undefined,
    social_links: social_links ? convertAppSocialLinks(social_links) : undefined,
  }
}
