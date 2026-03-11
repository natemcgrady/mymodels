import { parseApiUsername } from '@/lib/api-profile'
import { apiError, apiOk } from '@/lib/api-response'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/server/data/profiles'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username: rawUsername } = await params
  const username = parseApiUsername(rawUsername ?? '')
  if (!username) {
    return apiError(400, 'invalid_parameter', 'Invalid username.', {
      parameter: 'username',
      expectedPattern: '^[a-z0-9-]{1,40}$',
    })
  }

  const profile = await getProfileByUsername(username)
  if (!profile) {
    return apiError(404, 'not_found', 'Profile not found.')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const canEdit = Boolean(user?.id && profile.userId === user.id)

  return apiOk(
    {
      canEdit,
      mainEditor: canEdit ? profile.mainEditor : null,
    },
    {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
      },
    }
  )
}
