import { db } from '@/lib/db'
import { PROFILE_EDITOR_VALUES, type ProfileEditor } from '@/lib/profile-editors'
import { createProfileSlotRecord, PROFILE_SLOT_VALUES, type ProfileSlot } from '@/lib/profile-slots'
import { modelCatalog, profileModelSelections, profiles } from '@/server/db/schema'
import { and, eq, inArray } from 'drizzle-orm'

const USERNAME_MAX_LENGTH = 40
const USERNAME_SUFFIX_LIMIT = 100
const PROFILE_EDITOR_VALUE_SET = new Set<string>(PROFILE_EDITOR_VALUES)
const RESERVED_USERNAMES = new Set(['api', 'auth', 'opengraph-image'])

export function getUsernameHintFromMetadata(
  metadata: Record<string, unknown> | null
): string | null {
  if (!metadata || typeof metadata !== 'object') return null
  const v = (key: string) => {
    const val = metadata[key]
    if (typeof val === 'string' && val.trim()) return val.trim()
    return null
  }
  return v('user_name') ?? v('login') ?? v('preferred_username') ?? v('screen_name') ?? null
}

function normalizeUsername(input: string) {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, USERNAME_MAX_LENGTH)
  return slug.length > 0 ? slug : null
}

async function isUsernameTaken(username: string) {
  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1)
  return Boolean(existing)
}

function isReservedUsername(username: string) {
  return RESERVED_USERNAMES.has(username)
}

async function generateAvailableUsername(base: string, userId: string) {
  const normalizedBase = normalizeUsername(base) ?? `user-${userId.slice(0, 8)}`
  let candidate = normalizedBase
  let suffix = 0

  while (isReservedUsername(candidate) || (await isUsernameTaken(candidate))) {
    suffix += 1
    if (suffix > USERNAME_SUFFIX_LIMIT) {
      candidate = `${normalizedBase}-${Math.random().toString(36).slice(2, 6)}`
      break
    }
    const suffixText = `-${suffix}`
    const trimmedBase = normalizedBase.slice(0, USERNAME_MAX_LENGTH - suffixText.length)
    candidate = `${trimmedBase}${suffixText}`
  }
  return candidate
}

export async function ensureProfileForUser({
  userId,
  usernameHint,
  displayName,
  avatarUrl,
  githubUsername,
  twitterUsername,
}: {
  userId: string
  usernameHint?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  githubUsername?: string | null
  twitterUsername?: string | null
}) {
  const [existing] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)

  if (existing) {
    const updates: Partial<{
      avatarUrl: string | null
      displayName: string | null
      githubUsername: string | null
      twitterUsername: string | null
    }> = {}
    if (avatarUrl && avatarUrl !== existing.avatarUrl) {
      updates.avatarUrl = avatarUrl
    }
    if (displayName && displayName !== existing.displayName) {
      updates.displayName = displayName
    }
    if (githubUsername && githubUsername !== existing.githubUsername) {
      updates.githubUsername = githubUsername
    }
    if (twitterUsername && twitterUsername !== existing.twitterUsername) {
      updates.twitterUsername = twitterUsername
    }
    if (Object.keys(updates).length > 0) {
      const [updated] = await db
        .update(profiles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(profiles.userId, userId))
        .returning()
      return updated
    }
    return existing
  }

  const candidate = await generateAvailableUsername(usernameHint ?? userId.slice(0, 8), userId)
  const [created] = await db
    .insert(profiles)
    .values({
      userId,
      username: candidate,
      displayName: displayName ?? null,
      avatarUrl: avatarUrl ?? null,
      githubUsername: githubUsername ?? null,
      twitterUsername: twitterUsername ?? null,
    })
    .returning()
  return created
}

function enrichProfile(row: typeof profiles.$inferSelect) {
  return {
    ...row,
    displayName: row.displayName ?? row.username,
    image: row.avatarUrl ?? null,
    githubUrl: row.githubUsername ? `https://github.com/${row.githubUsername}` : null,
    twitterUrl: row.twitterUsername ? `https://x.com/${row.twitterUsername}` : null,
    mainEditor: normalizeProfileEditor(row.mainEditor),
  }
}

function normalizeProfileEditor(value: string | null | undefined): ProfileEditor | null {
  if (!value) return null
  if (!PROFILE_EDITOR_VALUE_SET.has(value)) return null
  return value as ProfileEditor
}

export async function getProfileByUserId(userId: string) {
  const [row] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1)
  if (!row) return null
  return enrichProfile(row)
}

export async function getProfileByUsername(username: string) {
  const normalizedUsername = username.trim()
  if (!normalizedUsername) return null

  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.username, normalizedUsername))
    .limit(1)
  if (!row) return null
  return enrichProfile(row)
}

export type PublicProfileModel = {
  id: number
  provider: string
  name: string
}

export type PublicProfileWithSelections = {
  username: string
  displayName: string
  image: string | null
  githubUrl: string | null
  twitterUrl: string | null
  mainEditor: ProfileEditor | null
  selections: Record<ProfileSlot, PublicProfileModel | null>
}

export async function getAllProfileUsernames() {
  const rows = await db.select({ username: profiles.username }).from(profiles)
  return rows.map((row) => row.username)
}

export async function getProfileSelections(profileId: number) {
  const rows = await db
    .select({
      slot: profileModelSelections.slot,
      model: modelCatalog,
    })
    .from(profileModelSelections)
    .innerJoin(modelCatalog, eq(profileModelSelections.modelId, modelCatalog.id))
    .where(eq(profileModelSelections.profileId, profileId))

  return rows.reduce<Record<ProfileSlot, typeof modelCatalog.$inferSelect | null>>(
    (acc, row) => {
      acc[row.slot] = row.model
      return acc
    },
    createProfileSlotRecord(() => null)
  )
}

export async function getPublicProfileWithSelectionsByUsername(
  username: string
): Promise<PublicProfileWithSelections | null> {
  const profile = await getProfileByUsername(username)
  if (!profile) return null

  const selections = await getProfileSelections(profile.id)

  return {
    username: profile.username,
    displayName: profile.displayName,
    image: profile.image,
    githubUrl: profile.githubUrl,
    twitterUrl: profile.twitterUrl,
    mainEditor: profile.mainEditor,
    selections: createProfileSlotRecord((slot) => {
      const model = selections[slot]
      if (!model) return null
      return {
        id: model.id,
        provider: model.provider,
        name: model.name,
      }
    }),
  }
}

export async function upsertProfileSelections({
  profileId,
  selections,
}: {
  profileId: number
  selections: Partial<Record<ProfileSlot, number | null>>
}) {
  const requestedIds = Object.values(selections).filter((value): value is number => Boolean(value))
  if (requestedIds.length > 0) {
    const rows = await db
      .select({ id: modelCatalog.id })
      .from(modelCatalog)
      .where(inArray(modelCatalog.id, requestedIds))
    if (rows.length !== new Set(requestedIds).size) {
      throw new Error('Invalid model selection')
    }
  }

  for (const slot of PROFILE_SLOT_VALUES) {
    if (!(slot in selections)) continue
    const modelId = selections[slot]
    if (!modelId) {
      await db
        .delete(profileModelSelections)
        .where(
          and(
            eq(profileModelSelections.profileId, profileId),
            eq(profileModelSelections.slot, slot)
          )
        )
      continue
    }
    await db
      .insert(profileModelSelections)
      .values({ profileId, slot, modelId })
      .onConflictDoUpdate({
        target: [profileModelSelections.profileId, profileModelSelections.slot],
        set: { modelId, updatedAt: new Date() },
      })
  }
}

export async function updateProfileMainEditor({
  profileId,
  mainEditor,
}: {
  profileId: number
  mainEditor: ProfileEditor | null
}) {
  await db
    .update(profiles)
    .set({
      mainEditor,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profileId))
}
