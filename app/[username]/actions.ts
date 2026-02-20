'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { ensureModelCatalog } from '@/server/data/model-catalog'
import { getProfileByUsername, upsertProfileSelections } from '@/server/data/profiles'

const formSchema = z.object({
  username: z.string().min(1),
  plan: z.string().optional(),
  build: z.string().optional(),
  debug: z.string().optional(),
})

function parseModelId(value: string | null | undefined) {
  if (!value) return null
  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    return null
  }
  return parsed
}

export async function updateProfileModels(formData: FormData) {
  const parsed = formSchema.parse({
    username: formData.get('username'),
    plan: formData.get('plan')?.toString() ?? '',
    build: formData.get('build')?.toString() ?? '',
    debug: formData.get('debug')?.toString() ?? '',
  })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.id) {
    throw new Error('Unauthorized')
  }

  const profile = await getProfileByUsername(parsed.username)
  if (!profile) {
    throw new Error('Profile not found')
  }

  if (profile.userId !== user.id) {
    throw new Error('Unauthorized')
  }

  await ensureModelCatalog()
  await upsertProfileSelections({
    profileId: profile.id,
    selections: {
      plan: parseModelId(parsed.plan),
      build: parseModelId(parsed.build),
      debug: parseModelId(parsed.debug),
    },
  })

  revalidatePath(`/${profile.username}`)
  revalidatePath('/')
}
