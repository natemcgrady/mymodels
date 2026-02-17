import { BuildStackHeroSection } from '@/components/build-stack-hero-section'
import { type ModelPreviewRow } from '@/components/example-profile-card'
import { formatSelectionLabel, getMetadataValue, sanitizeUsername } from '@/lib/profile-utils'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUserId, getProfileSelections } from '@/server/data/profiles'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = user ? await getProfileByUserId(user.id) : null
  const selections = profile ? await getProfileSelections(profile.id) : null
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
        displayName: 'Name',
        username: 'handle',
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
        <BuildStackHeroSection
          isLoggedIn={isLoggedIn}
          profileUsername={profile?.username ?? null}
          profile={exampleIdentity}
          modelRows={modelPreviewRows}
        />
      </div>
    </main>
  )
}
