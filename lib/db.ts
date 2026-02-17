import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '@/server/db/schema'
import { env } from '@/lib/env'

const sql = postgres(env.DATABASE_URL, {
  prepare: false,
})

export const db = drizzle(sql, { schema })

export type Database = typeof db
