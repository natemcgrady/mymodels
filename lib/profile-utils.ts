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
