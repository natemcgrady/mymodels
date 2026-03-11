import { NextRequest, NextResponse } from 'next/server'
import {
  getPublicProfileWithSelectionsByUsername,
  type PublicProfileWithSelections,
} from '@/server/data/profiles'

const USERNAME_PATTERN = /^[a-z0-9-]+$/
const USERNAME_MAX_LENGTH = 40

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params
  const username = parseUsername(rawUsername ?? '')
  if (!username) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
  }

  const profile = await getPublicProfileWithSelectionsByUsername(username)
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const fields = parseFields(request.nextUrl.searchParams.get('fields'))
  return NextResponse.json(pickFields(profile, fields), {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  })
}
