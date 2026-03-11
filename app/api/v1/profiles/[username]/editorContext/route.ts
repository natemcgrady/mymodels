import { toModelSummary } from '@/lib/api-contracts'
import { parseApiUsername } from '@/lib/api-profile'
import { apiError, apiOk } from '@/lib/api-response'
import { createClient } from '@/lib/supabase/server'
import { getModelCatalog } from '@/server/data/model-catalog'
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

  if (!user?.id || profile.userId !== user.id) {
    return apiOk(
      {
        canEdit: false,
        mainEditor: null,
        catalog: [],
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
        },
      }
    )
  }

  const catalog = await getModelCatalog()
  return apiOk(
    {
      canEdit: true,
      mainEditor: profile.mainEditor,
      catalog: catalog.map(toModelSummary),
    },
    {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=600',
      },
    }
  )
}
