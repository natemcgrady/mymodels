const defaultMetadataBase = 'http://localhost:3000'

function resolveMetadataBase(): URL {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    defaultMetadataBase

  try {
    return new URL(appUrl)
  } catch {
    return new URL(defaultMetadataBase)
  }
}

/**
 * Use www subdomain for image URLs when app URL is mymodels.dev (no www).
 * Avoids 307 redirects that Twitter/Facebook may not follow when fetching og:image.
 */
export function getImageBaseUrl(): string {
  const base = resolveMetadataBase()
  if (base.origin === 'https://mymodels.dev') {
    return 'https://www.mymodels.dev'
  }
  return base.origin
}

export { resolveMetadataBase }
