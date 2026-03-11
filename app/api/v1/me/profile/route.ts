import { toApiProfile } from '@/lib/api-contracts'
import { apiError, apiOk } from '@/lib/api-response'
import { createProfileSlotRecord } from '@/lib/profile-slots'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUserId, getProfileSelections } from '@/server/data/profiles'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return apiError(401, 'unauthorized', 'Authentication is required.')
    }

    const profile = await getProfileByUserId(user.id)
    const selections = profile
      ? await getProfileSelections(profile.id)
      : createProfileSlotRecord(() => null)

    const apiProfile = toApiProfile({
      username: profile?.username ?? null,
      displayName:
        profile?.displayName ??
        (user.user_metadata?.full_name as string) ??
        (user.user_metadata?.name as string) ??
        user.email ??
        null,
      imageUrl: profile?.image ?? (user.user_metadata?.avatar_url as string) ?? null,
      githubUrl: profile?.githubUrl ?? null,
      twitterUrl: profile?.twitterUrl ?? null,
      mainEditor: profile?.mainEditor ?? null,
      selections,
    })

    return apiOk(apiProfile, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
      },
    })
  } catch {
    return apiError(500, 'internal_error', 'Failed to load your profile.')
  }
}
