import { z } from 'zod'

import { emailSchema, passwordSchema } from './common'

import { AuthOperationsEnum } from '@/types/enums'

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Register form schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot be longer than 100 characters')
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and conditions' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Forgot password (email) schema
export const forgotPasswordEmailSchema = z.object({
  email: emailSchema,
})

// Forgot password (new password) schema
export const forgotPasswordPassSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Update password schema
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  })

// Export types
export type LoginFormInput = z.infer<typeof loginSchema>
export type RegisterFormInput = z.infer<typeof registerSchema>
export type ResetPasswordEmailFormInput = z.infer<typeof forgotPasswordEmailSchema>
export type ResetPasswordPassFormInput = z.infer<typeof forgotPasswordPassSchema>
export type UpdatePasswordFormInput = z.infer<typeof updatePasswordSchema>

// Auth form schemas mapping
export const authFormSchemas = {
  [AuthOperationsEnum.LOGIN]: loginSchema,
  [AuthOperationsEnum.REGISTER]: registerSchema,
  [AuthOperationsEnum.FORGOT_PASSWORD]: forgotPasswordEmailSchema,
  [AuthOperationsEnum.RESET_PASSWORD]: forgotPasswordPassSchema,
  [AuthOperationsEnum.UPDATE_PASSWORD]: updatePasswordSchema,
} as const
