import {
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
  integer,
  primaryKey,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { PROFILE_SLOT_VALUES } from '@/lib/profile-slots'

// ============================================================================
// MyModels Domain Tables
// ============================================================================
// Users and sessions are managed by Supabase Auth (auth.users).
// profiles.userId references auth.users.id (UUID).

export const profileSlot = pgEnum('profile_slot', PROFILE_SLOT_VALUES)

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(),
  username: varchar('username', { length: 40 }).notNull().unique(),
  displayName: varchar('display_name', { length: 128 }),
  avatarUrl: text('avatar_url'),
  githubUsername: varchar('github_username', { length: 64 }),
  twitterUsername: varchar('twitter_username', { length: 64 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

export const modelCatalog = pgTable(
  'model_catalog',
  {
    id: serial('id').primaryKey(),
    provider: varchar('provider', { length: 48 }).notNull(),
    name: varchar('name', { length: 128 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('model_catalog_provider_name_idx').on(table.provider, table.name)]
)

export const profileModelSelections = pgTable(
  'profile_model_selections',
  {
    profileId: integer('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    slot: profileSlot('slot').notNull(),
    modelId: integer('model_id')
      .notNull()
      .references(() => modelCatalog.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.profileId, table.slot] })]
)

// ============================================================================
// Type Exports
// ============================================================================

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type ModelCatalog = typeof modelCatalog.$inferSelect
export type NewModelCatalog = typeof modelCatalog.$inferInsert
export type ProfileModelSelection = typeof profileModelSelections.$inferSelect
export type NewProfileModelSelection = typeof profileModelSelections.$inferInsert
export type ProfileSlot = (typeof profileSlot.enumValues)[number]
