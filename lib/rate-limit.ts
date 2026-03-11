import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const hasUpstashEnv =
  typeof process.env.UPSTASH_REDIS_REST_URL === 'string' &&
  process.env.UPSTASH_REDIS_REST_URL.length > 0 &&
  typeof process.env.UPSTASH_REDIS_REST_TOKEN === 'string' &&
  process.env.UPSTASH_REDIS_REST_TOKEN.length > 0

const ratelimit = hasUpstashEnv
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      prefix: 'api:profile',
    })
  : null

/**
 * Rate limit by identifier (e.g. IP). Returns { success: true } or { success: false }.
 * When Upstash env vars are not set (e.g. local dev), always allows (success: true).
 */
export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  if (!ratelimit) return { success: true }
  const result = await ratelimit.limit(identifier)
  return { success: result.success }
}
