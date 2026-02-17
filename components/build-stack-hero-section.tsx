import Link from 'next/link'
import { ExampleProfileCard, type ModelPreviewRow } from '@/components/example-profile-card'
import { HeroVerbTypewriter } from '@/components/hero-verb-typewriter'

type HeroProfile = {
  displayName: string
  username: string
  image: string | null
}

export function BuildStackHeroSection({
  isLoggedIn,
  profileUsername,
  profile,
  modelRows,
}: {
  isLoggedIn: boolean
  profileUsername: string | null
  profile: HeroProfile
  modelRows: ModelPreviewRow[]
}) {
  return (
    <section className="animate-in fade-in fill-mode-both border-border/80 bg-card/60 relative overflow-hidden rounded-3xl border p-5 shadow-lg backdrop-blur-sm delay-75 duration-500 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
        <div className="space-y-5">
          <p className="font-pixel text-primary text-[10px] tracking-[0.22em] uppercase sm:text-xs">
            Build your AI stack card
          </p>
          <h1 className="text-foreground max-w-2xl text-3xl leading-tight font-semibold text-balance sm:text-5xl">
            How do you{' '}
            <span className="font-pixel text-primary inline-block">
              <HeroVerbTypewriter />
            </span>
            ?
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
            Create your model profile and compare against what the community is choosing for
            planning, implementation, and debugging.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={isLoggedIn ? (profileUsername ? `/${profileUsername}` : '/') : '/auth/signin'}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-md px-4 py-2 text-sm font-medium transition"
            >
              {isLoggedIn ? 'View your profile' : 'Sign in to personalize'}
            </Link>
            <Link
              href="#leaderboard"
              className="border-border bg-background/70 text-foreground hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium transition"
            >
              Browse leaderboard
            </Link>
          </div>
        </div>
        <ExampleProfileCard isLoggedIn={isLoggedIn} profile={profile} modelRows={modelRows} />
      </div>
    </section>
  )
}
