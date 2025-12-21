import { ProfileService } from './profile.service'
import { createClient } from '@/lib/supabase/server'
import { buildLogger } from '@/lib/logger/server'
import { handleServerError } from '@/lib/error/server'
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Logger } from '@/types/logger.types'

/**
 * Server-side profile service
 * Extends the abstract ProfileService with server-specific setup
 */
export class ProfileServerService extends ProfileService {
  private constructor(client: SupabaseClient<Database>, logger: Logger) {
    super(client, logger, handleServerError)
  }

  // Static factory method to handle async client creation
  static async create(): Promise<ProfileServerService> {
    const client = await createClient()
    const logger = buildLogger('ProfileServerService')
    return new ProfileServerService(client, logger)
  }
}

let profileServiceInstance: ProfileServerService | null = null

/**
 * Get the server-side profile service instance
 * @returns Promise that resolves to the ProfileServerService instance
 */
export async function getProfileService(): Promise<ProfileServerService> {
  if (!profileServiceInstance) {
    profileServiceInstance = await ProfileServerService.create()
  }
  return profileServiceInstance
}
