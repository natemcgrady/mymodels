import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProfileByUserId } from '@/server/data/profiles'
import { SignInWithGitHub, SignInWithX } from './sign-in-providers'

export default async function SignInPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const profile = await getProfileByUserId(user.id)
    redirect(profile ? `/${profile.username}` : '/')
  }

  return (
    <main
      id="main-content"
      className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 sm:px-6"
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
