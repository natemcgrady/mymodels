export type ProviderBrand = {
  color: string
  logoPath: string
}

export const PROVIDER_BRANDS: Record<string, ProviderBrand> = {
  Anthropic: {
    color: '#d97757',
    logoPath: '/anthropic-light.svg',
  },
  Cursor: {
    color: '#f54e00',
    logoPath: '/cursor.svg',
  },
  Google: {
    color: '#00639f',
    logoPath: '/google.svg',
  },
  OpenAI: {
    color: '#16b28b',
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
