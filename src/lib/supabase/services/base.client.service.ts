import type { SupabaseClient } from '@supabase/supabase-js'
import { handleClientError } from '@/lib/error'
import type { Database } from '@/types/supabase'
import type { Logger } from '@/types/logger.types'
import { BaseService } from './base.service'

/**
 * Client-side base service
 *
 * Extends the universal BaseService with client-specific error handling.
 * This is a thin wrapper that provides the client error handler.
 */
export abstract class BaseClientService extends BaseService {
  /**
   * Create a new BaseClientService instance
   * @param client - Required Supabase client (explicit injection)
   * @param logger - Required logger instance (explicit injection)
   */
  constructor(client: SupabaseClient<Database>, logger: Logger) {
    super(client, logger, handleClientError)
  }
}
