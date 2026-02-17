import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMetadataValue } from '@/lib/profile-utils'
import { getModelCatalog } from '@/server/data/model-catalog'
import { getProfileByUsername, getProfileSelections } from '@/server/data/profiles'
import { ModelSelectionForm } from '@/components/model-selection-form'
import { ProfileCard } from '@/components/profile-card'

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const normalizedUsername = username.trim()
  if (!normalizedUsername) {
    notFound()
  }

  const profile = await getProfileByUsername(normalizedUsername)
  if (!profile) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const canEdit = user?.id === profile.userId
  const metadata = user?.user_metadata ?? null
  const githubHandleFromMetadata =
    getMetadataValue(metadata, 'user_name') ?? getMetadataValue(metadata, 'preferred_username')
  const githubUrlFromMetadata =
    getMetadataValue(metadata, 'profile_url') ?? getMetadataValue(metadata, 'html_url')
  const githubUrl = canEdit
    ? (githubUrlFromMetadata ??
      (githubHandleFromMetadata ? `https://github.com/${githubHandleFromMetadata}` : null))
    : `https://github.com/${profile.username}`
  const twitterHandleFromMetadata =
    getMetadataValue(metadata, 'twitter_username') ??
    getMetadataValue(metadata, 'x_username') ??
    getMetadataValue(metadata, 'screen_name')
  const twitterUrlFromMetadata = getMetadataValue(metadata, 'twitter_url')
  const twitterUrl = canEdit
    ? (twitterUrlFromMetadata ??
      (twitterHandleFromMetadata
        ? `https://x.com/${twitterHandleFromMetadata.replace(/^@+/, '')}`
        : null))
    : null

  const selections = await getProfileSelections(profile.id)
  const catalog = canEdit ? await getModelCatalog() : []
  const modelSlots: Array<{
    slot: 'Plan' | 'Build' | 'Debug'
    model: (typeof selections)[keyof typeof selections]
  }> = [
    { slot: 'Plan', model: selections.plan },
    { slot: 'Build', model: selections.build },
    { slot: 'Debug', model: selections.debug },
  ]

  return (
    <main
      id="main-content"
      className="bg-background text-foreground relative min-h-screen scroll-mt-20 overflow-x-hidden"
    >
      <div className="relative mx-auto flex w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="animate-in fade-in fill-mode-both duration-500">
          <ProfileCard
            profile={{
              displayName: profile.displayName,
              username: profile.username,
              image: profile.image,
              githubUrl,
              twitterUrl,
            }}
            modelSlots={modelSlots}
            modelEditor={
              canEdit ? (
                <ModelSelectionForm
                  username={profile.username}
                  catalog={catalog}
                  initialSelections={{
                    plan: selections.plan?.id ?? null,
                    build: selections.build?.id ?? null,
                    debug: selections.debug?.id ?? null,
                  }}
                />
              ) : null
            }
          />
        </div>
      </div>
    </main>
  )
}
