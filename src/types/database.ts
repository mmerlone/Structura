import { PostgrestError } from '@supabase/supabase-js'

import { PrivacySettings, GenderPreference, NotificationPreferences, SocialLinks } from './profile.types'
import { Database } from './supabase'

// Profile types
export type DbProfile = Database['public']['Tables']['profiles']['Row']
export type DbProfileInsert = Omit<
  Database['public']['Tables']['profiles']['Insert'],
  'created_at' | 'updated_at' | 'id'
>
export type DbProfileUpdate = Omit<
  Database['public']['Tables']['profiles']['Update'],
  'created_at' | 'updated_at' | 'id'
>

export type Profile = Omit<DbProfile, 'privacy_settings' | 'gender' | 'notification_preferences' | 'social_links'> & {
  privacy_settings?: PrivacySettings | null
  gender?: GenderPreference | null
  notification_preferences?: NotificationPreferences | null
  social_links?: SocialLinks
}

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>

// Re-export other database types as needed
export type { Database }

// Helper types for database responses
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never
export type DbResultErr = PostgrestError

// Type for paginated results
export interface PaginatedResult<T> {
  data: T[]
  count: number | null
  page: number
  pageSize: number
  pageCount: number
}

// Type for database filters
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'contains'
  | 'containedBy'
  | 'overlap'

export type Filter<T> = {
  column: keyof T
  operator: FilterOperator
  value: unknown
}

export type OrderBy<T> = {
  column: keyof T
  ascending?: boolean
  nullsFirst?: boolean
}

// Type for query options
export type QueryOptions<T> = {
  select?: string
  filters?: Filter<T>[]
  orderBy?: OrderBy<T>
  limit?: number
  offset?: number
  page?: number
  pageSize?: number
}
