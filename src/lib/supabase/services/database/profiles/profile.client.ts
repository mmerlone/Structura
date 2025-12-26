import { ProfileService } from './profile.service'
import { createClient } from '@/lib/supabase/client'
import { buildLogger } from '@/lib/logger/client'
import { handleClientError } from '@/lib/error'

/**
 * Client-side profile service
 * Extends the abstract ProfileService with client-specific setup
 */
export class ProfileClientService extends ProfileService {
  constructor() {
    const client = createClient()
    const logger = buildLogger('ProfileClientService')
    super(client, logger, handleClientError)
  }
}

let profileServiceInstance: ProfileClientService | null = null

/**
 * Get the client-side profile service instance (singleton)
 * @returns ProfileClientService instance
 */
export function getProfileService(): ProfileClientService {
  if (typeof window === 'undefined') {
    throw new Error('getProfileService should only be called on the client side')
  }

  if (!profileServiceInstance) {
    profileServiceInstance = new ProfileClientService()
  }

  return profileServiceInstance
}
