import { db } from '@/lib/db'
import { modelCatalog, profileModelSelections, profiles } from '@/server/db/schema'
import { asc, desc, eq, sql } from 'drizzle-orm'

type Slot = 'plan' | 'build' | 'debug'

export type LeaderboardEntry = {
  modelId: number
  modelName: string
  provider: string
  votes: number
}

export type LeaderboardData = {
  totalProfiles: number
  overall: LeaderboardEntry[]
  bySlot: Record<Slot, LeaderboardEntry[]>
}

const voteCount = sql<number>`count(${profileModelSelections.modelId})`.mapWith(Number)

async function getLeaderboardForSlot(slot: Slot | null, limit: number) {
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
  const [overall, plan, build, debug, totalProfilesResult] = await Promise.all([
    getLeaderboardForSlot(null, limit),
    getLeaderboardForSlot('plan', limit),
    getLeaderboardForSlot('build', limit),
    getLeaderboardForSlot('debug', limit),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(profiles),
  ])

  return {
    totalProfiles: totalProfilesResult[0]?.count ?? 0,
    overall,
    bySlot: {
      plan,
      build,
      debug,
    },
  }
}
