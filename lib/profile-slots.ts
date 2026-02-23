export const PROFILE_SLOT_VALUES = [
  'plan',
  'build',
  'debug',
  'image_generation',
  'video_generation',
  'creative_writing',
  'audio',
  'general',
] as const

export type ProfileSlot = (typeof PROFILE_SLOT_VALUES)[number]

export type ProfileSlotRecord<T> = Record<ProfileSlot, T>

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
