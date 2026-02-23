import { db } from '@/lib/db'
import { PROFILE_SLOT_VALUES, type ProfileSlot } from '@/lib/profile-slots'
import { modelCatalog, profileModelSelections, profiles } from '@/server/db/schema'
import { asc, desc, eq, sql } from 'drizzle-orm'

export type LeaderboardEntry = {
  modelId: number
  modelName: string
  provider: string
  votes: number
}

export type LeaderboardData = {
  totalProfiles: number
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

export async function getLeaderboardData(limit = 8): Promise<LeaderboardData> {
  const [overall, slotEntries, totalProfilesResult] = await Promise.all([
    getLeaderboardForSlot(null, limit),
    Promise.all(
      PROFILE_SLOT_VALUES.map(async (slot) => [slot, await getLeaderboardForSlot(slot, limit)] as const)
    ),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(profiles),
  ])

  return {
    totalProfiles: totalProfilesResult[0]?.count ?? 0,
    overall,
    bySlot: Object.fromEntries(slotEntries) as Record<ProfileSlot, LeaderboardEntry[]>,
  }
}
