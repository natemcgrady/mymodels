import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getModelCatalog } from '@/server/data/model-catalog'
import { getProfileByUsername } from '@/server/data/profiles'

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')?.trim() ?? ''
  if (!username) {
    return NextResponse.json({ canEdit: false, catalog: [] }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    return NextResponse.json({ canEdit: false, catalog: [] })
  }

  const profile = await getProfileByUsername(username)
  if (!profile || profile.userId !== user.id) {
    return NextResponse.json({ canEdit: false, catalog: [] })
  }

  const catalog = await getModelCatalog()
  return NextResponse.json(
    { canEdit: true, catalog },
    {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
      },
    }
  )
}
