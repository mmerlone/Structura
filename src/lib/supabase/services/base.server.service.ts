import type { SupabaseClient } from '@supabase/supabase-js'
import { handleServerError } from '@/lib/error/server'
import type { Database } from '@/types/supabase'
import type { Logger } from '@/types/logger.types'
import { BaseService } from './base.service'

/**
 * Server-side base service
 *
 * Extends the universal BaseService with server-specific error handling.
 * This is a thin wrapper that provides the server error handler.
 */
export abstract class BaseServerService extends BaseService {
  /**
   * Create a new BaseServerService instance
   * @param client - Required Supabase client (explicit injection)
   * @param logger - Required logger instance (explicit injection)
   */
  constructor(client: SupabaseClient<Database>, logger: Logger) {
    super(client, logger, handleServerError)
  }
}
