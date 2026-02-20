'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SignInWithGitHub, SignInWithX } from './sign-in-providers'

type MeResponse = {
  username: string | null
}

export function SignInPageClient() {
  const router = useRouter()
  const { data: me, isFetched } = useQuery({
    queryKey: ['profile', 'me', 'signin'],
    queryFn: async () => {
      const response = await fetch('/api/profile/me')
      if (!response.ok) return { username: null } satisfies MeResponse
      return (await response.json()) as MeResponse
    },
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (!isFetched) return
    if (!me?.username) return
    router.replace(`/${me.username}`)
  }, [isFetched, me?.username, router])

  return (
    <main
      id="main-content"
      className="bg-background text-foreground flex flex-col items-center justify-center px-4 sm:px-6"
      style={{ minHeight: 'calc(100dvh - 73px)' }}
    >
      <div className="border-border bg-card flex w-full max-w-md flex-col items-center gap-6 border p-5 text-center sm:p-8">
        <div className="space-y-2">
          <p className="font-pixel text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
            MyModels.dev
          </p>
          <h1 className="text-foreground text-2xl font-semibold text-balance sm:text-3xl">
            Sign in to share your stack
          </h1>
          <p className="text-muted-foreground text-sm">
            Connect with GitHub or X to publish your Plan, Build, and Debug models.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <SignInWithGitHub />
          <SignInWithX />
        </div>
        <p className="text-muted-foreground text-xs">
          <Link href="/" className="hover:text-foreground underline underline-offset-4">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
