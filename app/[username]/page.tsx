import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getModelCatalog } from '@/server/data/model-catalog'
import { getProfileByUsername, getProfileSelections } from '@/server/data/profiles'
import { ModelSelectionForm } from '@/components/model-selection-form'
import { ProfileCard } from '@/components/profile-card'

type UserProfilePageProps = {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
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
              githubUrl: profile.githubUrl,
              twitterUrl: profile.twitterUrl,
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
