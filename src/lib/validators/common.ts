import { z } from 'zod'

import { SITE_CONFIG } from '@/config/site'

const {
  passwordRequirements: {
    minLength,
    requireUppercase,
    requireLowercase,
    requireNumber,
    requireSpecialChar,
    specialChars,
  },
} = SITE_CONFIG

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email cannot be longer than 255 characters')
  .toLowerCase()
  .trim()

export const passwordSchema = z
  .string()
  .min(minLength, `Password must be at least ${minLength} characters`)
  .max(100, 'Password cannot be longer than 100 characters')
  .refine((value) => !requireUppercase || /[A-Z]/.test(value), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((value) => !requireLowercase || /[a-z]/.test(value), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((value) => !requireNumber || /\d/.test(value), {
    message: 'Password must contain at least one number',
  })
  .refine(
    (value) =>
      !requireSpecialChar || new RegExp(`[${specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(value),
    {
      message: `Password must contain at least one special character (${specialChars})`,
    }
  )
