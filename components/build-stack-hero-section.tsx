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
  const ctaHref = isLoggedIn ? (profileUsername ? `/${profileUsername}` : '/') : '/auth/signin'
  const ctaLabel = isLoggedIn ? 'View your profile' : 'Sign in to personalize'

  return (
    <section className="border-border/80 bg-card/60 relative overflow-hidden border p-5 shadow-lg backdrop-blur-sm sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
        <div className="space-y-5">
          <p className="font-pixel text-primary text-[10px] tracking-[0.22em] uppercase sm:text-xs">
            Build your AI stack card
          </p>
          <h1 className="text-foreground max-w-2xl text-3xl leading-snug font-semibold text-balance sm:text-5xl sm:leading-tight">
            How do you{' '}
            <span className="font-pixel text-primary inline-block">
              <HeroVerbTypewriter />
            </span>
            ?
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
            Create your model stack profile and share it with your friends and so they always know
            what models you&apos;re using to plan, build, and debug.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={ctaHref}
              className="bg-foreground text-background hover:bg-foreground/90 inline-flex min-w-46 items-center justify-center px-4 py-2 text-center text-sm font-medium transition"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
        <ExampleProfileCard isLoggedIn={isLoggedIn} profile={profile} modelRows={modelRows} />
      </div>
    </section>
  )
}
