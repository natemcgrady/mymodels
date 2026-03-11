import { NextResponse } from 'next/server'
import { LEGACY_API_DEPRECATION_HEADERS } from '@/lib/api-deprecation'
import { createClient } from '@/lib/supabase/server'
import { getModelCatalog } from '@/server/data/model-catalog'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: LEGACY_API_DEPRECATION_HEADERS }
    )
  }

  const catalog = await getModelCatalog()
  return NextResponse.json(catalog, { headers: LEGACY_API_DEPRECATION_HEADERS })
}
