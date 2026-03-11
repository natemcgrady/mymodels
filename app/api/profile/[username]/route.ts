import { NextRequest, NextResponse } from 'next/server'
import { getPublicProfileWithSelectionsByUsername } from '@/server/data/profiles'

const USERNAME_PATTERN = /^[a-z0-9-]+$/
const USERNAME_MAX_LENGTH = 40

function parseUsername(value: string) {
  const username = value.trim().toLowerCase()
  if (!username || username.length > USERNAME_MAX_LENGTH) return null
  if (!USERNAME_PATTERN.test(username)) return null
  return username
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params
  const username = parseUsername(rawUsername ?? '')
  if (!username) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 })
  }

  const profile = await getPublicProfileWithSelectionsByUsername(username)
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json(profile, {
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
    },
  })
}
