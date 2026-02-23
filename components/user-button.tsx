'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
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

const PROFILE_QUERY_KEY = ['profile', 'me', 'header'] as const

export function UserButton({ initialUser = null }: UserButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const supabase = useMemo(() => createClient(), [])
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: profile, refetch } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    initialData: initialUser
      ? {
          username: initialUser.username,
          displayName: initialUser.displayName,
          image: initialUser.avatarUrl,
        }
      : undefined,
    queryFn: async () => {
      const response = await fetch('/api/profile/me', {
        cache: 'no-store',
      })
      if (!response.ok) {
        return null
      }
      return (await response.json()) as {
        username: string | null
        displayName: string | null
        image: string | null
      }
    },
    staleTime: 1000 * 60,
    refetchOnMount: 'always',
  })

  useEffect(() => {
    void refetch()
  }, [pathname, refetch])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
      router.refresh()
    })
    return () => subscription.unsubscribe()
  }, [queryClient, router, supabase])

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
    queryClient.setQueryData(PROFILE_QUERY_KEY, null)
    queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY })
    void refetch()
    router.refresh()
  }, [queryClient, refetch, router, supabase])

  const signIn = useCallback(() => {
    router.push('/auth/signin')
  }, [router])

  if (!profile?.username) {
    return (
      <button
        onClick={signIn}
        className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring border px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none"
      >
        Sign In
      </button>
    )
  }

  const displayName =
    profile.displayName ?? initialUser?.displayName ?? initialUser?.email ?? 'Signed in'
  const avatarUrl = profile?.image ?? null

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
            href={`/${profile.username}`}
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-muted px-3 py-2 text-sm transition"
            role="menuitem"
          >
            Profile
          </Link>
          <button
            type="button"
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
