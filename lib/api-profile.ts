import { NextRequest } from 'next/server'

const USERNAME_PATTERN = /^[a-z0-9-]{1,40}$/

export function parseApiUsername(value: string): string | null {
  const username = value.trim().toLowerCase()
  if (!USERNAME_PATTERN.test(username)) return null
  return username
}

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'anonymous'
  return request.headers.get('x-real-ip') ?? 'anonymous'
}
