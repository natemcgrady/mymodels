export const PROFILE_SLOT_VALUES = [
  'general',
  'plan',
  'build',
  'debug',
  'image_generation',
  'video_generation',
  'creative_writing',
  'audio',
] as const

export type ProfileSlot = (typeof PROFILE_SLOT_VALUES)[number]

export type ProfileSlotRecord<T> = Record<ProfileSlot, T>

export const PROFILE_SLOT_API_VALUES = [
  'general',
  'plan',
  'build',
  'debug',
  'imageGeneration',
  'videoGeneration',
  'creativeWriting',
  'audio',
] as const

export type ProfileSlotApi = (typeof PROFILE_SLOT_API_VALUES)[number]

export type ProfileSlotApiRecord<T> = Record<ProfileSlotApi, T>

const PROFILE_SLOT_DB_TO_API_MAP: ProfileSlotRecord<ProfileSlotApi> = {
  general: 'general',
  plan: 'plan',
  build: 'build',
  debug: 'debug',
  image_generation: 'imageGeneration',
  video_generation: 'videoGeneration',
  creative_writing: 'creativeWriting',
  audio: 'audio',
}

const PROFILE_SLOT_API_TO_DB_MAP: ProfileSlotApiRecord<ProfileSlot> = {
  general: 'general',
  plan: 'plan',
  build: 'build',
  debug: 'debug',
  imageGeneration: 'image_generation',
  videoGeneration: 'video_generation',
  creativeWriting: 'creative_writing',
  audio: 'audio',
}

const PROFILE_SLOT_API_VALUE_SET = new Set<string>(PROFILE_SLOT_API_VALUES)

export const PROFILE_SLOT_LABELS: ProfileSlotRecord<string> = {
  plan: 'Plan',
  build: 'Build',
  debug: 'Debug',
  image_generation: 'Image generation',
  video_generation: 'Video generation',
  creative_writing: 'Creative writing',
  audio: 'Audio',
  general: 'General',
}

export const PROFILE_SLOT_LEADERBOARD_DESCRIPTIONS: ProfileSlotRecord<string> = {
  plan: 'Models selected specifically for planning work.',
  build: 'Models chosen for coding and implementation.',
  debug: 'Models favored for troubleshooting and fixes.',
  image_generation: 'Models people pick for image generation.',
  video_generation: 'Models people pick for video generation.',
  creative_writing: 'Models selected for creative writing workflows.',
  audio: 'Models chosen for audio-focused tasks.',
  general: 'Models selected for everyday general usage.',
}

export const PROFILE_SLOT_CONFIG = PROFILE_SLOT_VALUES.map((id) => ({
  id,
  label: PROFILE_SLOT_LABELS[id],
}))

export function createProfileSlotRecord<T>(getValue: (slot: ProfileSlot) => T): ProfileSlotRecord<T> {
  return Object.fromEntries(PROFILE_SLOT_VALUES.map((slot) => [slot, getValue(slot)])) as ProfileSlotRecord<T>
}

export function createProfileSlotApiRecord<T>(
  getValue: (slot: ProfileSlotApi) => T
): ProfileSlotApiRecord<T> {
  return Object.fromEntries(
    PROFILE_SLOT_API_VALUES.map((slot) => [slot, getValue(slot)])
  ) as ProfileSlotApiRecord<T>
}

export function isProfileSlotApi(value: string): value is ProfileSlotApi {
  return PROFILE_SLOT_API_VALUE_SET.has(value)
}

export function profileSlotDbToApi(slot: ProfileSlot): ProfileSlotApi {
  return PROFILE_SLOT_DB_TO_API_MAP[slot]
}

export function profileSlotApiToDb(slot: ProfileSlotApi): ProfileSlot {
  return PROFILE_SLOT_API_TO_DB_MAP[slot]
}
