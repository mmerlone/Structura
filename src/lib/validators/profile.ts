import moment from 'moment-timezone'
import { z } from 'zod'

import { GenderPreference } from '@/types'
import { Profile } from '@/types/database'
import { GenderPreferenceEnum } from '@/types/enums'

type ProfileFormFields = Partial<
  Pick<
    Profile,
    | 'id'
    | 'email'
    | 'display_name'
    | 'first_name'
    | 'last_name'
    | 'phone'
    | 'bio'
    | 'company'
    | 'job_title'
    | 'website'
    | 'timezone'
    | 'country_code'
    | 'state'
    | 'city'
    | 'locale'
    | 'avatar_url'
    | 'birth_date'
    | 'gender'
  >
>

const nullableString = (maxLength = 255, fieldName = 'Field'): z.ZodType<string | null | undefined> =>
  z
    .string()
    .max(maxLength, {
      message: `${fieldName} must be less than ${maxLength} characters`,
    })
    .nullable()
    .optional()

export const profileFormSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Invalid email address'),
  display_name: z.string().min(1, 'Display name is required').max(100, 'Display name must be less than 100 characters'),

  first_name: nullableString(100, 'First name'),
  last_name: nullableString(100, 'Last name'),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, {
      message: 'Please enter a valid phone number',
    })
    .or(z.literal(''))
    .nullable()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  bio: nullableString(500, 'Bio'),
  company: nullableString(100, 'Company'),
  job_title: nullableString(100, 'Job title'),
  website: z
    .string()
    .url('Please enter a valid URL')
    .or(z.literal(''))
    .nullable()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  timezone: nullableString(50, 'Timezone'),
  country_code: nullableString(10, 'Country code'),
  state: nullableString(100, 'State'),
  city: nullableString(100, 'City'),
  locale: nullableString(10, 'Locale'),

  avatar_url: z.string().url('Please enter a valid URL').or(z.literal('')).nullable().optional(),
  birth_date: z
    .string()
    .nullable()
    .refine((val) => val === null || val === undefined || moment(val, 'YYYY-MM-DD', true).isValid(), {
      message: 'Invalid date format. Please use YYYY-MM-DD',
    })
    .transform((val) => {
      if (val === null || val === undefined) return null
      return moment(val, 'YYYY-MM-DD').format('YYYY-MM-DD')
    }),
  gender: z
    .enum([
      GenderPreferenceEnum.MALE,
      GenderPreferenceEnum.FEMALE,
      GenderPreferenceEnum.NON_BINARY,
      GenderPreferenceEnum.OTHER,
      GenderPreferenceEnum.PREFER_NOT_TO_SAY,
    ])
    .transform((val): GenderPreference | null => {
      if (val === null || val === undefined) return null
      return val
    })
    .nullable()
    .optional(),
} as const) satisfies z.ZodType<ProfileFormFields>

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const profileUpdateSchema = profileFormSchema
  .omit({
    id: true,
  })
  .partial()

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>

export const profileCreateSchema = profileFormSchema.omit({
  id: true,
})

export type ProfileCreateData = z.infer<typeof profileCreateSchema>
