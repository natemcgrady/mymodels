import { checkRateLimit } from '@/lib/rate-limit'
import { LEGACY_API_DEPRECATION_HEADERS } from '@/lib/api-deprecation'
import { PROFILE_SLOT_VALUES, type ProfileSlot } from '@/lib/profile-slots'
import {
  getPublicProfileWithSelectionsByUsername,
  type PublicProfileWithSelections,
} from '@/server/data/profiles'
import { NextRequest, NextResponse } from 'next/server'

const USERNAME_PATTERN = /^[a-z0-9-]+$/
const USERNAME_MAX_LENGTH = 40
const ALLOWED_SLOTS = new Set<ProfileSlot>(PROFILE_SLOT_VALUES)

const ALLOWED_FIELDS = new Set<keyof PublicProfileWithSelections>([
  'username',
  'displayName',
  'image',
  'githubUrl',
  'twitterUrl',
  'mainEditor',
  'selections',
])

function parseUsername(value: string) {
  const username = value.trim().toLowerCase()
  if (!username || username.length > USERNAME_MAX_LENGTH) return null
  if (!USERNAME_PATTERN.test(username)) return null
  return username
}

function parseFields(param: string | null): (keyof PublicProfileWithSelections)[] | null {
  if (!param) return null
  const requested = param
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)
  if (requested.length === 0) return null

  const valid = requested.filter((f) =>
    ALLOWED_FIELDS.has(f as keyof PublicProfileWithSelections)
  ) as (keyof PublicProfileWithSelections)[]
  return valid.length > 0 ? valid : null
}

function parseSlots(param: string | null): ProfileSlot[] | null {
  if (!param) return null

  const requested = param
    .split(',')
    .map((slot) => slot.trim().toLowerCase())
    .filter(Boolean)
  if (requested.length === 0) return null

  const uniqueValidSlots: ProfileSlot[] = []
  const seen = new Set<ProfileSlot>()
  for (const slot of requested) {
    if (!ALLOWED_SLOTS.has(slot as ProfileSlot)) continue
    const typedSlot = slot as ProfileSlot
    if (seen.has(typedSlot)) continue
    seen.add(typedSlot)
    uniqueValidSlots.push(typedSlot)
  }

  return uniqueValidSlots.length > 0 ? uniqueValidSlots : null
}

function pickSelectionSlots(
  profile: PublicProfileWithSelections,
  slots: ProfileSlot[] | null
): PublicProfileWithSelections {
  if (!slots) return profile

  const selections = slots.reduce<Partial<PublicProfileWithSelections['selections']>>((acc, slot) => {
    acc[slot] = profile.selections[slot]
    return acc
  }, {})

  return {
    ...profile,
    selections: selections as PublicProfileWithSelections['selections'],
  }
}

function pickFields(
  profile: PublicProfileWithSelections,
  fields: (keyof PublicProfileWithSelections)[] | null
): Partial<PublicProfileWithSelections> | PublicProfileWithSelections {
  if (!fields) return profile
  const result: Partial<PublicProfileWithSelections> = {}
  for (const key of fields) {
    ;(result as Record<string, unknown>)[key] = profile[key]
  }
  return result
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'anonymous'
  return request.headers.get('x-real-ip') ?? 'anonymous'
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { success } = await checkRateLimit(getClientIdentifier(request))
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: LEGACY_API_DEPRECATION_HEADERS }
    )
  }

  const { username: rawUsername } = await params
  const username = parseUsername(rawUsername ?? '')
  if (!username) {
    return NextResponse.json(
      { error: 'Invalid username' },
      { status: 400, headers: LEGACY_API_DEPRECATION_HEADERS }
    )
  }

  const profile = await getPublicProfileWithSelectionsByUsername(username)
  if (!profile) {
    return NextResponse.json(
      { error: 'Profile not found' },
      { status: 404, headers: LEGACY_API_DEPRECATION_HEADERS }
    )
  }

  const slots = parseSlots(request.nextUrl.searchParams.get('slots'))
  const fields = parseFields(request.nextUrl.searchParams.get('fields'))
  return NextResponse.json(pickFields(pickSelectionSlots(profile, slots), fields), {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
      ...LEGACY_API_DEPRECATION_HEADERS,
    },
  })
}
