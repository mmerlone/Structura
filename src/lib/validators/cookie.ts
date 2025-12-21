import { z } from 'zod'

export const cookiePreferencesSchema = z.object({
  necessary: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
  functional: z.boolean(),
})
