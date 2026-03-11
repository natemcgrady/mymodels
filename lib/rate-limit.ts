import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redisUrl = process.env.KV_REST_API_URL
const redisToken = process.env.KV_REST_API_TOKEN

const hasRedisEnv =
  typeof redisUrl === 'string' &&
  redisUrl.length > 0 &&
  typeof redisToken === 'string' &&
  redisToken.length > 0

const ratelimit = hasRedisEnv
  ? new Ratelimit({
      redis: new Redis({ url: redisUrl, token: redisToken }),
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      prefix: 'api:profile',
    })
  : null

/**
 * Rate limit by identifier (e.g. IP). Returns { success: true } or { success: false }.
 * When KV_REST_API_URL / KV_REST_API_TOKEN are not set (e.g. local dev), always allows (success: true).
 */
export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  if (!ratelimit) return { success: true }
  const result = await ratelimit.limit(identifier)
  return { success: result.success }
}
