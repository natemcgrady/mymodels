import { config } from 'dotenv'

import { defineConfig } from 'drizzle-kit'

// Load .env then .env.local (Next.js local overrides)
config()
config({ path: '.env.local', override: true })

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
