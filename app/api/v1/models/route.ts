import { toModelSummary } from '@/lib/api-contracts'
import { apiError, apiOk } from '@/lib/api-response'
import { getModelCatalog } from '@/server/data/model-catalog'

export async function GET() {
  try {
    const catalog = await getModelCatalog()
    return apiOk(catalog.map(toModelSummary), {
      meta: { nextCursor: null },
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      },
    })
  } catch {
    return apiError(500, 'internal_error', 'Failed to load model catalog.')
  }
}
