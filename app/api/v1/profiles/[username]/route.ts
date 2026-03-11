import { parseApiSlotQuery, toApiProfile } from '@/lib/api-contracts'
import { getClientIdentifier, parseApiUsername } from '@/lib/api-profile'
import { apiError, apiOk } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { getPublicProfileWithSelectionsByUsername } from '@/server/data/profiles'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { success } = await checkRateLimit(getClientIdentifier(request))
  if (!success) {
    return apiError(429, 'rate_limited', 'Too many requests. Please try again soon.')
  }

  const { username: rawUsername } = await params
  const username = parseApiUsername(rawUsername ?? '')
  if (!username) {
    return apiError(400, 'invalid_parameter', 'Invalid username.', {
      parameter: 'username',
      expectedPattern: '^[a-z0-9-]{1,40}$',
    })
  }

  const { slots, invalid } = parseApiSlotQuery(request.nextUrl.searchParams.getAll('slot'))
  if (invalid.length > 0) {
    return apiError(400, 'invalid_parameter', 'One or more slot values are invalid.', {
      parameter: 'slot',
      invalidValues: invalid,
    })
  }

  const profile = await getPublicProfileWithSelectionsByUsername(username)
  if (!profile) {
    return apiError(404, 'not_found', 'Profile not found.')
  }

  return apiOk(
    toApiProfile({
      username: profile.username,
      displayName: profile.displayName,
      imageUrl: profile.image,
      githubUrl: profile.githubUrl,
      twitterUrl: profile.twitterUrl,
      mainEditor: profile.mainEditor,
      selections: profile.selections,
      requestedSlots: slots.length > 0 ? slots : null,
    }),
    {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      },
    }
  )
}
