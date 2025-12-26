import { z } from 'zod'

import { cookiePreferencesSchema } from './cookie'

/**
 * Schema for data sharing preferences
 */
export const dataSharingSchema = z
  .object({
    third_parties: z.boolean().default(false),
    analytics: z.boolean().default(false),
    marketing: z.boolean().default(false),
  })
  .default({})

/**
 * Schema for communication preferences
 */
export const communicationPreferencesSchema = z
  .object({
    email: z.boolean().default(false),
    push: z.boolean().default(false),
    sms: z.boolean().default(false),
  })
  .default({})

/**
 * Schema for privacy settings
 * Matches the PrivacySettings interface from @/types/profile.types
 */
export const privacySettingsSchema = z
  .object({
    cookie_preferences: cookiePreferencesSchema.optional(),
    data_sharing: dataSharingSchema.optional(),
    communication_preferences: communicationPreferencesSchema.optional(),
  })
  .default({})

// Type exports
export type DataSharing = z.infer<typeof dataSharingSchema>
export type CommunicationPreferences = z.infer<typeof communicationPreferencesSchema>
export type PrivacySettings = z.infer<typeof privacySettingsSchema>
