import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUserId, getProfileSelections } from '@/server/data/profiles'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await getProfileByUserId(user.id)
  const selections = profile ? await getProfileSelections(profile.id) : null

  return NextResponse.json(
    {
      username: profile?.username ?? null,
      displayName:
        profile?.displayName ??
        (user.user_metadata?.full_name as string) ??
        (user.user_metadata?.name as string) ??
        user.email ??
        null,
      image: profile?.image ?? (user.user_metadata?.avatar_url as string) ?? null,
      selections: {
        plan: selections?.plan?.name ?? null,
        build: selections?.build?.name ?? null,
        debug: selections?.debug?.name ?? null,
      },
    },
    {
      headers: {
        // This endpoint is user-specific; allow short-lived browser caching.
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
      },
    }
  )
}
