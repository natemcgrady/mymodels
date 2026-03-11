import { NextResponse } from 'next/server'
import { LEGACY_API_DEPRECATION_HEADERS } from '@/lib/api-deprecation'
import { createProfileSlotRecord } from '@/lib/profile-slots'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUserId, getProfileSelections } from '@/server/data/profiles'

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
      selections: createProfileSlotRecord((slot) => selections?.[slot]?.name ?? null),
    },
    {
      headers: {
        // This endpoint is user-specific; allow short-lived browser caching.
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
        ...LEGACY_API_DEPRECATION_HEADERS,
      },
    }
  )
}
