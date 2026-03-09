import { db } from '@/lib/db'
import { getProfileEditorOption } from '@/lib/profile-editors'
import { PROFILE_SLOT_VALUES, type ProfileSlot } from '@/lib/profile-slots'
import { modelCatalog, profileModelSelections, profiles } from '@/server/db/schema'
import { asc, desc, eq, and, isNotNull, ne, sql } from 'drizzle-orm'

export type LeaderboardEntry = {
  modelId: number
  modelName: string
  provider: string
  votes: number
}

export type EditorLeaderboardEntry = {
  editor: string
  label: string
  votes: number
}

export type LeaderboardData = {
  totalProfiles: number
  byMainEditor: EditorLeaderboardEntry[]
  overall: LeaderboardEntry[]
  bySlot: Record<ProfileSlot, LeaderboardEntry[]>
}

const voteCount = sql<number>`count(${profileModelSelections.modelId})`.mapWith(Number)

async function getLeaderboardForSlot(slot: ProfileSlot | null, limit: number) {
  const baseQuery = db
    .select({
      modelId: modelCatalog.id,
      modelName: modelCatalog.name,
      provider: modelCatalog.provider,
      votes: voteCount,
    })
    .from(profileModelSelections)
    .innerJoin(modelCatalog, eq(profileModelSelections.modelId, modelCatalog.id))

  const filteredQuery = slot ? baseQuery.where(eq(profileModelSelections.slot, slot)) : baseQuery

  return filteredQuery
    .groupBy(modelCatalog.id, modelCatalog.name, modelCatalog.provider)
    .orderBy(desc(voteCount), asc(modelCatalog.name))
    .limit(limit)
}

const editorVoteCount = sql<number>`count(*)`.mapWith(Number)

async function getEditorLeaderboard(limit = 8): Promise<EditorLeaderboardEntry[]> {
  const rows = await db
    .select({
      editor: profiles.mainEditor,
      votes: editorVoteCount,
    })
    .from(profiles)
    .where(and(isNotNull(profiles.mainEditor), ne(profiles.mainEditor, '')))
    .groupBy(profiles.mainEditor)
    .orderBy(desc(editorVoteCount), asc(profiles.mainEditor))
    .limit(limit)

  return rows
    .filter((r): r is typeof r & { editor: string } => r.editor != null)
    .map((r) => ({
      editor: r.editor,
      label: getProfileEditorOption(r.editor)?.label ?? r.editor,
      votes: r.votes,
    }))
}

export async function getLeaderboardData(limit = 8): Promise<LeaderboardData> {
  const [overall, slotEntries, totalProfilesResult, byMainEditor] = await Promise.all([
    getLeaderboardForSlot(null, limit),
    Promise.all(
      PROFILE_SLOT_VALUES.map(async (slot) => [slot, await getLeaderboardForSlot(slot, limit)] as const)
    ),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(profiles),
    getEditorLeaderboard(limit),
  ])

  return {
    totalProfiles: totalProfilesResult[0]?.count ?? 0,
    byMainEditor,
    overall,
    bySlot: Object.fromEntries(slotEntries) as Record<ProfileSlot, LeaderboardEntry[]>,
  }
}
