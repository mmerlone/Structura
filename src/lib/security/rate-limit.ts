/**
 * Rate Limiting Utilities
 *
 * Configurable rate limiting middleware using centralized configuration
 * from src/config/security.ts. Provides protection against brute force
 * attacks and API abuse.
 *
 * Supports multiple storage backends:
 * - Memory (development/single instance)
 * - Redis (production/multi-instance)
 * - Vercel KV (Vercel deployments)
 */

import { SECURITY_CONFIG } from '@/config/security'
import { buildLogger } from '@/lib/logger/server'
import type {
  RateLimitStore,
  RateLimitEntry,
  RateLimitResult,
  RateLimiterConfig,
  RateLimitStats,
  ValidationResult,
} from '@/types/security.types'
import { NextRequest, NextResponse } from 'next/server'

const logger = buildLogger('security-rate-limit')

/**
 * In-memory rate limit store (for development/single instance)
 * WARNING: Not suitable for production with multiple instances
 */
class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>()

  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = this.store.get(key)
    if (!entry) return null

    // Clean up expired entries
    if (Date.now() > entry.resetTime) {
      this.store.delete(key)
      return null
    }

    return entry
  }

  async set(key: string, value: RateLimitEntry, ttl: number): Promise<void> {
    this.store.set(key, value)

    // Clean up after TTL
    setTimeout(() => {
      this.store.delete(key)
    }, ttl)
  }

  async increment(key: string): Promise<RateLimitEntry> {
    const existing = await this.get(key)

    if (existing) {
      existing.count++
      this.store.set(key, existing)
      return existing
    } else {
      const windowMs = 15 * 60 * 1000 // Default 15 minutes
      const resetTime = Date.now() + windowMs
      const newEntry: RateLimitEntry = { count: 1, resetTime }

      await this.set(key, newEntry, windowMs)
      return newEntry
    }
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }
}

/**
 * Redis client interface for type safety
 */
interface RedisClient {
  get(key: string): Promise<string | null>
  setex(key: string, seconds: number, value: string): Promise<void>
  del(key: string): Promise<number>
}

/**
 * Vercel KV client interface for type safety
 */
interface VercelKVClient {
  get(key: string): Promise<string | RateLimitEntry | null>
  setex(key: string, seconds: number, value: string): Promise<void>
  del(key: string): Promise<number>
}

/**
 * Redis rate limit store (for production/multi-instance)
 * Requires Redis client to be configured
 */
class RedisRateLimitStore implements RateLimitStore {
  private redis: RedisClient

  constructor(redisClient: RedisClient) {
    this.redis = redisClient
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    try {
      const data = await this.redis.get(key)
      if (!data) return null

      const entry: RateLimitEntry = JSON.parse(data)

      // Check if expired
      if (Date.now() > entry.resetTime) {
        await this.redis.del(key)
        return null
      }

      return entry
    } catch (error) {
      logger.error({ error, key }, 'Error getting rate limit entry from Redis')
      return null
    }
  }

  async set(key: string, value: RateLimitEntry, ttl: number): Promise<void> {
    try {
      const ttlSeconds = Math.ceil(ttl / 1000)
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      logger.error({ error, key, ttl }, 'Error setting rate limit entry in Redis')
    }
  }

  async increment(key: string): Promise<RateLimitEntry> {
    try {
      const existing = await this.get(key)

      if (existing) {
        existing.count++
        const ttl = existing.resetTime - Date.now()
        await this.set(key, existing, ttl)
        return existing
      } else {
        const windowMs = 15 * 60 * 1000 // Default 15 minutes
        const resetTime = Date.now() + windowMs
        const newEntry: RateLimitEntry = { count: 1, resetTime }

        await this.set(key, newEntry, windowMs)
        return newEntry
      }
    } catch (error) {
      logger.error({ error, key }, 'Error incrementing rate limit in Redis')
      // Fallback to allowing request
      return { count: 1, resetTime: Date.now() + 15 * 60 * 1000 }
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      logger.error({ error, key }, 'Error deleting rate limit entry from Redis')
    }
  }
}

/**
 * Vercel KV rate limit store (for Vercel deployments)
 * Requires @vercel/kv package
 */
class VercelKVRateLimitStore implements RateLimitStore {
  private kv: VercelKVClient

  constructor(kvClient: VercelKVClient) {
    this.kv = kvClient
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    try {
      const data = await this.kv.get(key)
      if (!data) return null

      const entry: RateLimitEntry = typeof data === 'string' ? JSON.parse(data) : data

      // Check if expired
      if (Date.now() > entry.resetTime) {
        await this.kv.del(key)
        return null
      }

      return entry
    } catch (error) {
      logger.error({ error, key }, 'Error getting rate limit entry from Vercel KV')
      return null
    }
  }

  async set(key: string, value: RateLimitEntry, ttl: number): Promise<void> {
    try {
      const ttlSeconds = Math.ceil(ttl / 1000)
      await this.kv.setex(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      logger.error({ error, key, ttl }, 'Error setting rate limit entry in Vercel KV')
    }
  }

  async increment(key: string): Promise<RateLimitEntry> {
    try {
      const existing = await this.get(key)

      if (existing) {
        existing.count++
        const ttl = existing.resetTime - Date.now()
        await this.set(key, existing, ttl)
        return existing
      } else {
        const windowMs = 15 * 60 * 1000 // Default 15 minutes
        const resetTime = Date.now() + windowMs
        const newEntry: RateLimitEntry = { count: 1, resetTime }

        await this.set(key, newEntry, windowMs)
        return newEntry
      }
    } catch (error) {
      logger.error({ error, key }, 'Error incrementing rate limit in Vercel KV')
      // Fallback to allowing request
      return { count: 1, resetTime: Date.now() + 15 * 60 * 1000 }
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.kv.del(key)
    } catch (error) {
      logger.error({ error, key }, 'Error deleting rate limit entry from Vercel KV')
    }
  }
}

/**
 * Initialize rate limit store based on environment
 */
async function initializeRateLimitStore(): Promise<RateLimitStore> {
  // Check for Vercel KV
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      // Use eval to avoid TypeScript module resolution
      const kvModule = await eval('import("@vercel/kv")')
      if (kvModule?.kv) {
        logger.info({}, 'Using Vercel KV for rate limiting')
        return new VercelKVRateLimitStore(kvModule.kv as VercelKVClient)
      }
    } catch (error) {
      logger.warn({ error }, 'Vercel KV environment variables found but @vercel/kv package not installed')
    }
  }

  // Check for Redis
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    try {
      // Try ioredis first
      const ioredisModule = await eval('import("ioredis")').catch(() => null)
      if (ioredisModule?.default) {
        const Redis = ioredisModule.default
        const redis = new Redis(
          process.env.REDIS_URL || {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
          }
        )
        logger.info({}, 'Using Redis (ioredis) for rate limiting')
        return new RedisRateLimitStore(redis as RedisClient)
      }

      // Fallback to redis client
      const redisModule = await eval('import("redis")').catch(() => null)
      if (redisModule?.createClient) {
        const redis = redisModule.createClient({
          url: process.env.REDIS_URL,
        })
        await (redis as RedisClient & { connect?: () => Promise<void> }).connect?.()
        logger.info({}, 'Using Redis (redis) for rate limiting')
        return new RedisRateLimitStore(redis as RedisClient)
      }
    } catch (error) {
      logger.warn({ error }, 'Redis environment variables found but no Redis package installed')
    }
  }

  // Fallback to memory store
  if (process.env.NODE_ENV === 'production') {
    logger.warn(
      {},
      'Using in-memory rate limiting in production. This is not recommended for multi-instance deployments. Consider using Redis or Vercel KV.'
    )
  } else {
    logger.info({}, 'Using in-memory rate limiting for development')
  }

  return new MemoryRateLimitStore()
}

/**
 * Global rate limit store instance
 */
let rateLimitStore: RateLimitStore | null = null

/**
 * Get or initialize the rate limit store
 */
async function getRateLimitStore(): Promise<RateLimitStore> {
  if (!rateLimitStore) {
    rateLimitStore = await initializeRateLimitStore()
  }
  return rateLimitStore
}

/**
 * Set custom rate limit store (e.g., for testing or custom implementations)
 */
export function setRateLimitStore(store: RateLimitStore): void {
  rateLimitStore = store
  logger.info({}, 'Custom rate limit store configured')
}

/**
 * Generate rate limit key from request
 */
function generateRateLimitKey(
  request: NextRequest,
  prefix: string,
  customKeyGenerator?: (request: NextRequest) => string
): string {
  if (customKeyGenerator) {
    return `${prefix}:${customKeyGenerator(request)}`
  }

  // Use IP address as default key
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-vercel-forwarded-for') ||
    'unknown'

  return `${prefix}:${ip}`
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimiterConfig,
  keyPrefix: string = 'rate-limit'
): Promise<RateLimitResult> {
  try {
    // Check if request should be skipped
    if (config.skip && config.skip(request)) {
      return {
        success: true,
        limit: config.max,
        remaining: config.max,
        resetTime: Date.now() + config.windowMs,
      }
    }

    // Generate rate limit key
    const key = generateRateLimitKey(request, keyPrefix, config.keyGenerator)

    // Get rate limit store and increment
    const store = await getRateLimitStore()
    const entry = await store.increment(key)

    const result: RateLimitResult = {
      success: entry.count <= config.max,
      limit: config.max,
      remaining: Math.max(0, config.max - entry.count),
      resetTime: entry.resetTime,
    }

    if (!result.success) {
      result.retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000)

      // Log rate limit exceeded
      logger.warn(
        {
          key,
          count: entry.count,
          limit: config.max,
          resetTime: entry.resetTime,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          path: request.nextUrl.pathname,
        },
        'Rate limit exceeded'
      )

      // Call onLimitReached callback if provided
      if (config.onLimitReached) {
        config.onLimitReached(request, result)
      }
    }

    return result
  } catch (error) {
    logger.error({ error, keyPrefix }, 'Error applying rate limit')

    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit: config.max,
      remaining: config.max,
      resetTime: Date.now() + config.windowMs,
    }
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult,
  config: RateLimiterConfig
): NextResponse {
  if (config.standardHeaders) {
    response.headers.set('RateLimit-Limit', result.limit.toString())
    response.headers.set('RateLimit-Remaining', result.remaining.toString())
    response.headers.set('RateLimit-Reset', new Date(result.resetTime).toISOString())
  }

  if (config.legacyHeaders) {
    response.headers.set('X-RateLimit-Limit', result.limit.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())
  }

  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString())
  }

  return response
}

/**
 * Create rate limit error response
 */
export function createRateLimitErrorResponse(result: RateLimitResult, config: RateLimiterConfig): NextResponse {
  const response = NextResponse.json(
    {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: config.message,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime,
        retryAfter: result.retryAfter,
      },
    },
    { status: 429 }
  )

  return addRateLimitHeaders(response, result, config)
}

/**
 * Rate limiter middleware factory
 */
export function createRateLimiter(
  type: keyof typeof SECURITY_CONFIG.rateLimit,
  customConfig?: Partial<RateLimiterConfig>
) {
  const baseConfig = SECURITY_CONFIG.rateLimit[type]
  const config: RateLimiterConfig = {
    ...baseConfig,
    ...customConfig,
  }

  return async (request: NextRequest, response?: NextResponse): Promise<NextResponse> => {
    const result = await applyRateLimit(request, config, `rate-limit-${type}`)

    if (!result.success) {
      return createRateLimitErrorResponse(result, config)
    }

    // Add rate limit headers to successful response
    const finalResponse = response || NextResponse.next()
    return addRateLimitHeaders(finalResponse, result, config)
  }
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  auth: createRateLimiter('auth'),
  api: createRateLimiter('api'),
  upload: createRateLimiter('upload'),
  passwordReset: createRateLimiter('passwordReset'),
  emailVerification: createRateLimiter('emailVerification'),
}

/**
 * General rate limiter middleware
 */
export async function rateLimiter(
  request: NextRequest,
  response: NextResponse,
  type: keyof typeof SECURITY_CONFIG.rateLimit = 'api'
): Promise<NextResponse> {
  try {
    const limiter = rateLimiters[type]
    return await limiter(request, response)
  } catch (error) {
    logger.error({ error, type, path: request.nextUrl.pathname }, 'Rate limiter error')
    return response
  }
}

/**
 * Rate limit middleware for specific endpoints
 */
export function withRateLimit(
  type: keyof typeof SECURITY_CONFIG.rateLimit,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Apply rate limiting
      const rateLimitResult = await rateLimiters[type](request)

      // If rate limited, return error response
      if (rateLimitResult.status === 429) {
        return rateLimitResult
      }

      // Execute handler
      const response = await handler(request)

      // Add rate limit headers to response
      const config = SECURITY_CONFIG.rateLimit[type]
      const result = await applyRateLimit(request, config, `rate-limit-${type}`)

      return addRateLimitHeaders(response, result, config)
    } catch (error) {
      logger.error({ error, type }, 'Error in rate limit wrapper')

      // Return error response with rate limit headers
      const errorResponse = NextResponse.json({ error: 'Internal server error' }, { status: 500 })

      return errorResponse
    }
  }
}

/**
 * Get current rate limit status for a request
 */
export async function getRateLimitStatus(
  request: NextRequest,
  type: keyof typeof SECURITY_CONFIG.rateLimit
): Promise<RateLimitResult | null> {
  try {
    const config = SECURITY_CONFIG.rateLimit[type]
    const key = generateRateLimitKey(request, `rate-limit-${type}`)
    const store = await getRateLimitStore()
    const entry = await store.get(key)

    if (!entry) {
      return {
        success: true,
        limit: config.max,
        remaining: config.max,
        resetTime: Date.now() + config.windowMs,
      }
    }

    return {
      success: entry.count <= config.max,
      limit: config.max,
      remaining: Math.max(0, config.max - entry.count),
      resetTime: entry.resetTime,
      retryAfter: entry.count > config.max ? Math.ceil((entry.resetTime - Date.now()) / 1000) : undefined,
    }
  } catch (error) {
    logger.error({ error, type }, 'Error getting rate limit status')
    return null
  }
}

/**
 * Clear rate limit for a request (admin function)
 */
export async function clearRateLimit(
  request: NextRequest,
  type: keyof typeof SECURITY_CONFIG.rateLimit
): Promise<void> {
  try {
    const key = generateRateLimitKey(request, `rate-limit-${type}`)
    const store = await getRateLimitStore()
    await store.delete(key)

    logger.info({ key, type }, 'Rate limit cleared')
  } catch (error) {
    logger.error({ error, type }, 'Error clearing rate limit')
  }
}

/**
 * Get rate limiting statistics (requires custom store implementation)
 */
export async function getRateLimitStats(): Promise<RateLimitStats> {
  // This would require a more sophisticated store implementation
  // For now, return empty stats
  return {
    totalRequests: 0,
    blockedRequests: 0,
    blockRate: 0,
    topBlockedIPs: [],
  }
}

/**
 * Validate rate limit configuration
 */
export function validateRateLimitConfig(): ValidationResult {
  const issues: string[] = []

  try {
    const rateLimitConfig = SECURITY_CONFIG.rateLimit

    Object.entries(rateLimitConfig).forEach(([type, config]) => {
      if (config.max <= 0) {
        issues.push(`${type}: max must be greater than 0`)
      }

      if (config.windowMs <= 0) {
        issues.push(`${type}: windowMs must be greater than 0`)
      }

      if (!config.message || config.message.trim() === '') {
        issues.push(`${type}: message cannot be empty`)
      }
    })

    // Check production rate limiting setup
    if (process.env.NODE_ENV === 'production') {
      const hasRedis = !!(process.env.REDIS_URL || process.env.REDIS_HOST)
      const hasVercelKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

      if (!hasRedis && !hasVercelKV) {
        issues.push(
          'Production deployment detected but no persistent rate limit store configured. ' +
            'Consider setting up Redis (REDIS_URL) or Vercel KV (KV_REST_API_URL, KV_REST_API_TOKEN) ' +
            'for multi-instance deployments.'
        )
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    }
  } catch (error) {
    issues.push(`Error validating rate limit config: ${error}`)
    return {
      isValid: false,
      issues,
    }
  }
}
