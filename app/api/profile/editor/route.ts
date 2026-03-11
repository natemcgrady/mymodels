import { NextRequest, NextResponse } from 'next/server'
import { LEGACY_API_DEPRECATION_HEADERS } from '@/lib/api-deprecation'
import { createClient } from '@/lib/supabase/server'
import { getModelCatalog } from '@/server/data/model-catalog'
import { getProfileByUsername } from '@/server/data/profiles'

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')?.trim() ?? ''
  if (!username) {
    return NextResponse.json(
      { canEdit: false, catalog: [], mainEditor: null },
      { status: 400, headers: LEGACY_API_DEPRECATION_HEADERS }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return NextResponse.json(
      { canEdit: false, catalog: [], mainEditor: null },
      { headers: LEGACY_API_DEPRECATION_HEADERS }
    )
  }

  const profile = await getProfileByUsername(username)
  if (!profile || profile.userId !== user.id) {
    return NextResponse.json(
      { canEdit: false, catalog: [], mainEditor: null },
      { headers: LEGACY_API_DEPRECATION_HEADERS }
    )
  }

  const catalog = await getModelCatalog()
  return NextResponse.json(
    { canEdit: true, catalog, mainEditor: profile.mainEditor ?? null },
    {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
        ...LEGACY_API_DEPRECATION_HEADERS,
      },
    }
  )
}
