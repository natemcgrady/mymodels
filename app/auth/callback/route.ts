import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureProfileForUser, getUsernameHintFromMetadata } from '@/server/data/profiles'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const profile = await ensureProfileForUser({
        userId: data.user.id,
        usernameHint: getUsernameHintFromMetadata(data.user.user_metadata),
        displayName:
          (data.user.user_metadata?.full_name as string) ??
          (data.user.user_metadata?.name as string) ??
          data.user.email ??
          null,
        avatarUrl: (data.user.user_metadata?.avatar_url as string) ?? null,
      })
      const fallback = profile ? `/${profile.username}` : '/'
      return NextResponse.redirect(`${origin}${next === '/' ? fallback : next}`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
