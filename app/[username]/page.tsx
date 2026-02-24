import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getImageBaseUrl } from '@/lib/metadata-base'
import { createProfileSlotRecord, PROFILE_SLOT_CONFIG } from '@/lib/profile-slots'
import { getProfileByUsername, getProfileSelections } from '@/server/data/profiles'
import { ProfileCard } from '@/components/profile-card'
import { ProfileEditorGate } from '@/components/profile-editor-gate'

type UserProfilePageProps = {
  params: Promise<{ username: string }>
}

export const revalidate = 300
export const dynamic = 'force-static'
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { username } = await params
  const normalizedUsername = username.trim()
  if (!normalizedUsername) return {}

  const profile = await getProfileByUsername(normalizedUsername)
  if (!profile) return {}

  const displayName = profile.displayName || profile.username
  const title = `${displayName} (@${profile.username}) | mymodels.dev`
  const description = `See the AI models ${displayName} uses for planning, building, and debugging.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `${getImageBaseUrl()}/${normalizedUsername}/share-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'profile',
      url: `/${normalizedUsername}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: `${getImageBaseUrl()}/${normalizedUsername}/share-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params
  const normalizedUsername = username.trim()
  if (!normalizedUsername) {
    notFound()
  }

  const profile = await getProfileByUsername(normalizedUsername)
  if (!profile) {
    notFound()
  }

  const selections = await getProfileSelections(profile.id)
  const modelSlots = PROFILE_SLOT_CONFIG.map(({ id, label }) => ({
    slot: label,
    model: selections[id],
  }))

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
              mainEditor: profile.mainEditor,
            }}
            modelSlots={modelSlots}
            modelEditor={
              <ProfileEditorGate
                username={profile.username}
                initialSelections={createProfileSlotRecord((slot) => selections[slot]?.id ?? null)}
                initialMainEditor={profile.mainEditor}
              />
            }
          />
        </div>
      </div>
    </main>
  )
}
