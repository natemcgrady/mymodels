import Image from 'next/image'
import Link from 'next/link'
import { User } from 'lucide-react'
import { HeroVerbTypewriter } from '@/components/layout/hero-verb-typewriter'
import { LeaderboardSection } from '@/components/leaderboard/leaderboard-section'
import { createClient } from '@/lib/supabase/server'
import { getLeaderboardData } from '@/server/data/leaderboard'
import { getProfileByUserId, getProfileSelections } from '@/server/data/profiles'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = user ? await getProfileByUserId(user.id) : null
  const selections = profile ? await getProfileSelections(profile.id) : null
  const leaderboard = await getLeaderboardData()
  const metadata = user?.user_metadata ?? null
  const metadataDisplayName =
    getMetadataValue(metadata, 'full_name') ?? getMetadataValue(metadata, 'name')
  const metadataUsername =
    getMetadataValue(metadata, 'user_name') ?? getMetadataValue(metadata, 'preferred_username')
  const emailUsername = user?.email?.split('@')[0] ?? null
  const resolvedDisplayName = profile?.displayName ?? metadataDisplayName ?? 'Signed In User'
  const resolvedUsername = sanitizeUsername(profile?.username ?? metadataUsername ?? emailUsername)
  const resolvedAvatarUrl = profile?.image ?? getMetadataValue(metadata, 'avatar_url')
  const isLoggedIn = Boolean(user)

  const exampleIdentity = isLoggedIn
    ? {
        displayName: resolvedDisplayName,
        username: resolvedUsername,
        image: resolvedAvatarUrl,
      }
    : {
        displayName: 'Example Name',
        username: 'your-handle',
        image: null,
      }

  const modelPreviewRows: ModelPreviewRow[] = isLoggedIn
    ? [
        {
          label: 'Plan',
          value: formatSelectionLabel(selections?.plan, 'Choose your planning model'),
        },
        {
          label: 'Build',
          value: formatSelectionLabel(selections?.build, 'Choose your build model'),
        },
        {
          label: 'Debug',
          value: formatSelectionLabel(selections?.debug, 'Choose your debug model'),
        },
      ]
    : [
        { label: 'Plan', value: 'Claude 4.6 Opus' },
        { label: 'Build', value: 'GPT-5.3 Codex' },
        { label: 'Debug', value: 'Composer 1.5' },
      ]

  return (
    <main
      id="main-content"
      className="bg-background text-foreground relative min-h-screen scroll-mt-20 overflow-x-hidden"
    >
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:gap-14 sm:px-6 sm:py-10">
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
                  href={
                    isLoggedIn ? (profile?.username ? `/${profile.username}` : '/') : '/auth/signin'
                  }
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
            <ExampleProfileCard
              isLoggedIn={isLoggedIn}
              profile={exampleIdentity}
              modelRows={modelPreviewRows}
            />
          </div>
        </section>

        <section
          id="leaderboard"
          className="animate-in fade-in fill-mode-both border-border/80 bg-card/70 relative scroll-mt-24 overflow-hidden rounded-2xl border p-4 shadow-sm backdrop-blur-sm delay-300 duration-500 sm:p-6"
        >
          <div className="mb-5 space-y-1.5 sm:mb-6">
            <p className="font-pixel text-muted-foreground text-[10px] tracking-[0.2em] uppercase sm:text-xs">
              Community leaderboard
            </p>
            <h2 className="text-foreground text-2xl font-semibold text-balance sm:text-3xl">
              Top model picks by slot
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              See which models are currently most selected across every profile.
            </p>
          </div>
          <LeaderboardSection
            tabs={[
              {
                key: 'overall',
                label: 'Overall',
                title: 'Overall Top Models',
                description: 'Popularity across all profile slots.',
                entries: leaderboard.overall,
              },
              {
                key: 'plan',
                label: 'Plan',
                title: 'Top Models for Plan',
                description: 'Models selected specifically for planning work.',
                entries: leaderboard.bySlot.plan,
              },
              {
                key: 'build',
                label: 'Build',
                title: 'Top Models for Build',
                description: 'Models chosen for coding and implementation.',
                entries: leaderboard.bySlot.build,
              },
              {
                key: 'debug',
                label: 'Debug',
                title: 'Top Models for Debug',
                description: 'Models favored for troubleshooting and fixes.',
                entries: leaderboard.bySlot.debug,
              },
            ]}
          />
        </section>
      </div>
    </main>
  )
}

type ModelPreviewRow = {
  label: 'Plan' | 'Build' | 'Debug'
  value: string
}

function ExampleProfileCard({
  isLoggedIn,
  profile,
  modelRows,
}: {
  isLoggedIn: boolean
  profile: {
    displayName: string
    username: string
    image: string | null
  }
  modelRows: ModelPreviewRow[]
}) {
  return (
    <article className="border-border/85 bg-background/85 relative overflow-hidden rounded-2xl border p-4 shadow-md sm:p-6">
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {isLoggedIn ? (
              profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.displayName}
                  width={56}
                  height={56}
                  className="border-border h-12 w-12 rounded-full border object-cover sm:h-14 sm:w-14"
                />
              ) : (
                <div className="border-border bg-muted text-foreground flex h-12 w-12 items-center justify-center rounded-full border text-base font-semibold sm:h-14 sm:w-14 sm:text-lg">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </div>
              )
            ) : (
              <div className="border-border bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full border sm:h-14 sm:w-14">
                <User className="size-5 sm:size-6" aria-hidden />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-foreground truncate text-base font-semibold sm:text-lg">
                {profile.displayName}
              </p>
              <p className="font-pixel text-muted-foreground truncate text-[10px] tracking-[0.16em] uppercase sm:text-[11px]">
                @{profile.username}
              </p>
            </div>
          </div>
          <span className="font-pixel text-primary shrink-0 text-[10px] tracking-[0.18em] uppercase sm:text-[11px]">
            {isLoggedIn ? 'Live preview' : 'Example profile'}
          </span>
        </div>

        <div className="space-y-2.5">
          {modelRows.map((row) => (
            <div
              key={row.label}
              className="border-border bg-card/80 flex min-w-0 items-center justify-between gap-4 rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3"
            >
              <span className="font-pixel text-muted-foreground shrink-0 text-[10px] tracking-[0.15em] uppercase sm:text-[11px]">
                {row.label}
              </span>
              <span className="text-foreground min-w-0 truncate text-right text-xs font-medium sm:text-sm">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {!isLoggedIn ? (
          <p className="text-muted-foreground text-xs sm:text-sm">
            Sign in to replace this example with your real avatar and model stack.
          </p>
        ) : null}
      </div>
    </article>
  )
}

function getMetadataValue(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== 'object') {
    return null
  }

  const value = (metadata as Record<string, unknown>)[key]
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function sanitizeUsername(value: string | null | undefined): string {
  const candidate = value?.replace(/^@+/, '').trim()
  return candidate && candidate.length > 0 ? candidate : 'your-handle'
}

function formatSelectionLabel(
  selection: { name: string; provider: string } | null | undefined,
  fallback: string
): string {
  if (!selection) {
    return fallback
  }
  return `${selection.name} (${selection.provider})`
}
