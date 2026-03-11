import type { ProfileEditor } from '@/lib/profile-editors'
import {
  createProfileSlotApiRecord,
  isProfileSlotApi,
  profileSlotApiToDb,
  type ProfileSlotApi,
  type ProfileSlotApiRecord,
  type ProfileSlotRecord,
} from '@/lib/profile-slots'

export type ApiErrorCode =
  | 'unauthorized'
  | 'not_found'
  | 'invalid_parameter'
  | 'rate_limited'
  | 'forbidden'
  | 'internal_error'

export type ModelSummary = {
  id: string
  provider: string
  slug: string
  displayName: string
}

export type ProfileSelections = ProfileSlotApiRecord<ModelSummary | null>

export type Profile = {
  username: string | null
  displayName: string | null
  imageUrl: string | null
  githubUrl: string | null
  twitterUrl: string | null
  mainEditor: ProfileEditor | null
  selections: ProfileSelections
}

export type ProfilePermission = {
  canEdit: boolean
  mainEditor: ProfileEditor | null
}

export type ProfileEditorContext = ProfilePermission & {
  catalog: ModelSummary[]
}

type DbModelLike = {
  id: number | string
  provider: string
  name: string
}

const LEGACY_SLOT_ALIAS: Record<string, ProfileSlotApi> = {
  image_generation: 'imageGeneration',
  video_generation: 'videoGeneration',
  creative_writing: 'creativeWriting',
}

function slugifyPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function buildModelSlug(provider: string, name: string): string {
  return `${slugifyPart(provider)}-${slugifyPart(name)}`
}

export function toModelSummary(model: DbModelLike): ModelSummary {
  return {
    id: String(model.id),
    provider: model.provider,
    slug: buildModelSlug(model.provider, model.name),
    displayName: model.name,
  }
}

function normalizeSlotToken(value: string): string {
  const token = value.trim()
  if (!token) return ''
  return LEGACY_SLOT_ALIAS[token] ?? token
}

export function parseApiSlotQuery(values: string[]): {
  slots: ProfileSlotApi[]
  invalid: string[]
} {
  const deduped: ProfileSlotApi[] = []
  const seen = new Set<ProfileSlotApi>()
  const invalid: string[] = []

  for (const rawValue of values) {
    const normalized = normalizeSlotToken(rawValue)
    if (!normalized) continue
    if (!isProfileSlotApi(normalized)) {
      invalid.push(rawValue)
      continue
    }

    const slot = normalized
    if (seen.has(slot)) continue
    seen.add(slot)
    deduped.push(slot)
  }

  return {
    slots: deduped,
    invalid,
  }
}

export function toApiSelectionsFromDb(
  selections: ProfileSlotRecord<DbModelLike | null>,
  requestedSlots: ProfileSlotApi[] | null = null
): ProfileSelections {
  const requestedSet = requestedSlots ? new Set<ProfileSlotApi>(requestedSlots) : null

  return createProfileSlotApiRecord((apiSlot) => {
    if (requestedSet && !requestedSet.has(apiSlot)) {
      return null
    }
    const dbSlot = profileSlotApiToDb(apiSlot)
    const model = selections[dbSlot]
    return model ? toModelSummary(model) : null
  })
}

export function toApiProfile({
  username,
  displayName,
  imageUrl,
  githubUrl,
  twitterUrl,
  mainEditor,
  selections,
  requestedSlots,
}: {
  username: string | null
  displayName: string | null
  imageUrl: string | null
  githubUrl: string | null
  twitterUrl: string | null
  mainEditor: ProfileEditor | null
  selections: ProfileSlotRecord<DbModelLike | null>
  requestedSlots?: ProfileSlotApi[] | null
}): Profile {
  return {
    username,
    displayName,
    imageUrl,
    githubUrl,
    twitterUrl,
    mainEditor,
    selections: toApiSelectionsFromDb(selections, requestedSlots ?? null),
  }
}

export function toDbSelectionShapeFromApi(
  selections: ProfileSlotApiRecord<DbModelLike | null>
): ProfileSlotRecord<DbModelLike | null> {
  const result = {} as ProfileSlotRecord<DbModelLike | null>
  for (const [apiSlot, model] of Object.entries(selections) as [ProfileSlotApi, DbModelLike | null][]) {
    const dbSlot = profileSlotApiToDb(apiSlot)
    result[dbSlot] = model
  }
  return result
}
