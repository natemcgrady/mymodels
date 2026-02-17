'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function UserButton() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
    })
    return () => subscription.unsubscribe()
  }, [queryClient, supabase])

  const { data: profile } = useQuery({
    queryKey: ['profile', 'me', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const response = await fetch('/api/profile/me')
      if (!response.ok) {
        return { username: null }
      }
      return (await response.json()) as { username: string | null }
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

  if (loading) {
    return (
      <div
        className="border-border bg-muted h-8 w-8 animate-pulse rounded-full border"
        role="status"
        aria-label="Loading user information"
      >
        <span className="sr-only">Loading…</span>
      </div>
    )
  }

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring rounded-md border px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none"
      >
        Sign In
      </button>
    )
  }

  const displayName =
    (user.user_metadata?.full_name as string) ??
    (user.user_metadata?.name as string) ??
    user.email ??
    'Signed in'

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="border-border hover:bg-muted focus-visible:ring-ring rounded-full border p-0.5 transition focus-visible:ring-2 focus-visible:outline-none"
        aria-label="Open account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user.user_metadata?.avatar_url ? (
          <Image
            src={user.user_metadata.avatar_url as string}
            alt={displayName}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="bg-muted text-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="border-border bg-card absolute right-0 z-20 mt-2 flex w-40 flex-col gap-1 rounded-lg border p-1 shadow-lg"
        >
          <Link
            href={profile?.username ? `/${profile.username}` : '/'}
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-muted rounded-md px-3 py-2 text-sm transition"
            role="menuitem"
          >
            Profile
          </Link>
          <button
            onClick={signOut}
            className="text-foreground hover:bg-muted focus-visible:ring-ring rounded-md px-3 py-2 text-left text-sm transition focus-visible:ring-2 focus-visible:outline-none"
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
