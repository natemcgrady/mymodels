import { db } from '@/lib/db'
import { MODEL_CATALOG } from '@/lib/model-catalog'
import { modelCatalog } from '@/server/db/schema'
import { asc } from 'drizzle-orm'

let ensureModelCatalogPromise: Promise<void> | null = null

export async function ensureModelCatalog() {
  if (!ensureModelCatalogPromise) {
    ensureModelCatalogPromise = db
      .insert(modelCatalog)
      .values(MODEL_CATALOG)
      .onConflictDoNothing({ target: [modelCatalog.provider, modelCatalog.name] })
      .then(() => undefined)
      .catch((error) => {
        ensureModelCatalogPromise = null
        throw error
      })
  }

  await ensureModelCatalogPromise
}

export async function getModelCatalog() {
  await ensureModelCatalog()
  return db.select().from(modelCatalog).orderBy(asc(modelCatalog.provider), asc(modelCatalog.name))
}

export function groupCatalogByProvider(models: Awaited<ReturnType<typeof getModelCatalog>>) {
  return models.reduce<Record<string, typeof models>>((acc, model) => {
    const bucket = acc[model.provider] ?? []
    bucket.push(model)
    acc[model.provider] = bucket
    return acc
  }, {})
}
