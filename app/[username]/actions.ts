'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createProfileSlotRecord } from '@/lib/profile-slots'
import { createClient } from '@/lib/supabase/server'
import { ensureModelCatalog } from '@/server/data/model-catalog'
import { getProfileByUsername, upsertProfileSelections } from '@/server/data/profiles'

const slotFormShape = createProfileSlotRecord(() => z.string().optional())

const formSchema = z.object({
  username: z.string().min(1),
  ...slotFormShape,
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
  const rawSelections = createProfileSlotRecord((slot) => formData.get(slot)?.toString() ?? '')
  const parsed = formSchema.parse({
    username: formData.get('username'),
    ...rawSelections,
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
    selections: createProfileSlotRecord((slot) => parseModelId(parsed[slot])),
  })

  revalidatePath(`/${profile.username}`)
  revalidatePath('/')
}
