import { Control, FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form'

import { CookiePreferences } from './cookie.types'
import { Profile, ProfileUpdate, ProfileInsert } from './database'
import { GenderPreferenceEnum, NotificationPreferencesEnum } from './enums'

import { ProfileFormValues } from '@/lib/validators'

// Base Profile types from database
export type { Profile }
export type { ProfileUpdate }
export type { ProfileInsert }

export type GenderPreference = `${GenderPreferenceEnum}`
export type NotificationPreferences = `${NotificationPreferencesEnum}`

// Props for form sections
export interface ProfileSectionProps {
  control: Control<ProfileFormValues>
  errors: FieldErrors<ProfileFormValues>
  register?: UseFormRegister<ProfileFormValues>
  watch?: UseFormWatch<ProfileFormValues>
  isSubmitting?: boolean
  disabled?: boolean
}

// Type for location data
export interface LocationData {
  country: string
  state: string
  city: string
}

export interface PrivacySettings {
  cookie_preferences?: CookiePreferences
  data_sharing?: {
    third_parties?: boolean
    analytics?: boolean
    marketing?: boolean
  }
  communication_preferences?: {
    email?: boolean
    push?: boolean
    sms?: boolean
  }
}

// Generic type for links
export type SocialLink = {
  id: string
  url: string
  title: string
}

export type SocialLinks = SocialLink[]
