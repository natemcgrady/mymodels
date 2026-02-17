/**
 * Upgrades Twitter/X profile image URLs from low-res variants (_normal 48x48,
 * _bigger 73x73, _mini 24x24) to the original full-resolution image.
 */
export function toHighResAvatarUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const trimmed = url.trim()
  if (!trimmed.includes('pbs.twimg.com')) return trimmed
  return trimmed.replace(/_(normal|bigger|mini)(\.\w+)$/i, '$2')
}

export function getMetadataValue(metadata: unknown, key: string): string | null {
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

export function sanitizeUsername(value: string | null | undefined): string {
  const candidate = value?.replace(/^@+/, '').trim()
  return candidate && candidate.length > 0 ? candidate : 'your-handle'
}

export function formatSelectionLabel(
  selection: { name: string; provider: string } | null | undefined,
  fallback: string
): string {
  if (!selection) {
    return fallback
  }
  return `${selection.name} (${selection.provider})`
}
