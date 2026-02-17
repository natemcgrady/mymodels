import { config } from 'dotenv'
import { z } from 'zod'

// Load .env and .env.local for CLI scripts (db:seed, etc.)
config({ path: '.env' })
config({ path: '.env.local', override: true })

/**
 * Server-side environment variables schema
 * These are validated at build time and runtime
 */
const serverEnvSchema = z.object({
  // Database (Supabase Postgres)
  DATABASE_URL: z.string().url().describe('Supabase PostgreSQL connection string'),

  // Supabase (auth + optional storage)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().describe('Supabase project URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).describe('Supabase anon (publishable) key'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

/**
 * Client-side environment variables schema
 * These are exposed to the browser (prefixed with NEXT_PUBLIC_)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

/**
 * Validate and export environment variables
 */
function validateEnv() {
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    console.warn('⚠️ Skipping environment validation')
    return {
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') ?? 'development',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    }
  }

  const serverEnv = serverEnvSchema.safeParse(process.env)
  const clientEnv = clientEnvSchema.safeParse(process.env)

  if (!serverEnv.success) {
    console.error('❌ Invalid server environment variables:')
    console.error(serverEnv.error.flatten().fieldErrors)
    throw new Error('Invalid server environment variables')
  }

  if (!clientEnv.success) {
    console.error('❌ Invalid client environment variables:')
    console.error(clientEnv.error.flatten().fieldErrors)
    throw new Error('Invalid client environment variables')
  }

  return {
    ...serverEnv.data,
    ...clientEnv.data,
  }
}

export const env = validateEnv()
export type Env = typeof env
