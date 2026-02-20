import Link from 'next/link'
import { getMetadataValue } from '@/lib/profile-utils'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUserId } from '@/server/data/profiles'
import { UserButton } from '@/components/user-button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Logo } from './logo'

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = user ? await getProfileByUserId(user.id) : null
  const metadata = user?.user_metadata ?? null

  const initialUser = user
    ? {
        id: user.id,
        email: user.email ?? null,
        displayName:
          profile?.displayName ??
          getMetadataValue(metadata, 'full_name') ??
          getMetadataValue(metadata, 'name') ??
          user.email ??
          'Signed in',
        avatarUrl: profile?.image ?? getMetadataValue(metadata, 'avatar_url'),
        username: profile?.username ?? null,
      }
    : null

  return (
    <header className="border-border bg-background/95 sticky top-0 z-40 h-[76px] border-b backdrop-blur-sm">
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="mymodels.dev"
            className="focus-visible:ring-ring focus-visible: flex items-center transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
          >
            <Logo size={32} />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton initialUser={initialUser} />
        </div>
      </div>
    </header>
  )
}
