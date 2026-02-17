export type ProviderBrand = {
  color: string
  logoPath: string
}

export const PROVIDER_BRANDS: Record<string, ProviderBrand> = {
  Anthropic: {
    color: '#D4A574',
    logoPath: '/anthropic-light.svg',
  },
  Cursor: {
    color: '#6B57FF',
    logoPath: '/cursor.svg',
  },
  Google: {
    color: '#4285F4',
    logoPath: '/google.svg',
  },
  OpenAI: {
    color: '#10A37F',
    logoPath: '/openai-light.svg',
  },
  xAI: {
    color: '#111111',
    logoPath: '/xai-light.svg',
  },
}

export function getProviderBrand(provider: string): ProviderBrand | null {
  return PROVIDER_BRANDS[provider] ?? null
}
