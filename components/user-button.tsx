'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

type InitialUser = {
  id: string
  email: string | null
  displayName: string
  avatarUrl: string | null
  username: string | null
}

type UserButtonProps = {
  initialUser?: InitialUser | null
}

export function UserButton({ initialUser = null }: UserButtonProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<InitialUser | null>(initialUser)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setUser(null)
        return
      }

      setUser((current) => ({
        id: user.id,
        email: user.email ?? null,
        displayName:
          current?.displayName ??
          (user.user_metadata?.full_name as string) ??
          (user.user_metadata?.name as string) ??
          user.email ??
          'Signed in',
        avatarUrl: current?.avatarUrl ?? (user.user_metadata?.avatar_url as string) ?? null,
        username: current?.username ?? null,
      }))
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user
      setUser(
        authUser
          ? {
              id: authUser.id,
              email: authUser.email ?? null,
              displayName:
                (authUser.user_metadata?.full_name as string) ??
                (authUser.user_metadata?.name as string) ??
                authUser.email ??
                'Signed in',
              avatarUrl: (authUser.user_metadata?.avatar_url as string) ?? null,
              username: null,
            }
          : null
      )
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    })
    return () => subscription.unsubscribe()
  }, [queryClient, supabase])

  const { data: profile } = useQuery({
    queryKey: ['profile', 'me', user?.id],
    enabled: Boolean(user),
    initialData: user
      ? {
          username: user.username,
          displayName: user.displayName,
          image: user.avatarUrl,
        }
      : undefined,
    queryFn: async () => {
      const response = await fetch('/api/profile/me')
      if (!response.ok) {
        return { username: null, displayName: null, image: null }
      }
      return (await response.json()) as {
        username: string | null
        displayName: string | null
        image: string | null
      }
    },
    staleTime: 1000 * 60 * 10,
  })

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setOpen(false)
    queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    router.refresh()
  }, [queryClient, router, supabase])

  const signIn = useCallback(() => {
    router.push('/auth/signin')
  }, [router])

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring border px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none"
      >
        Sign In
      </button>
    )
  }

  const displayName = profile?.displayName ?? user.displayName ?? user.email ?? 'Signed in'
  const avatarUrl = profile?.image ?? user.avatarUrl

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="border-border hover:bg-muted focus-visible:ring-ring flex min-h-[44px] min-w-[44px] items-center justify-center border p-0.5 transition focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={32}
            height={32}
            className="object-cover"
            loading="eager"
            unoptimized
          />
        ) : (
          <div className="bg-muted text-foreground flex h-8 w-8 items-center justify-center text-xs font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="border-border bg-card absolute right-0 z-20 mt-2 flex w-40 flex-col gap-1 overflow-y-auto overscroll-contain border p-1 shadow-lg"
        >
          <Link
            href={profile?.username ? `/${profile.username}` : '/'}
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-muted px-3 py-2 text-sm transition"
            role="menuitem"
          >
            Profile
          </Link>
          <button
            onClick={signOut}
            className="text-foreground hover:bg-muted focus-visible:ring-ring px-3 py-2 text-left text-sm transition focus-visible:ring-2 focus-visible:outline-none"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
