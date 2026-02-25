import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getImageBaseUrl, resolveMetadataBase } from '@/lib/metadata-base'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import { SiteHeader } from '@/components/site-header'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { GeistPixelSquare } from 'geist/font/pixel'
import { Analytics } from '@vercel/analytics/next'

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: 'mymodels.dev',
  description: 'Share the models you use for planning, building, and debugging.',
  icons: {
    icon: [
      {
        url: '/favicon-light.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
  openGraph: {
    title: 'mymodels.dev',
    description: 'Share the models you use for planning, building, and debugging.',
    images: [
      {
        url: `${getImageBaseUrl()}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'mymodels.dev',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mymodels.dev',
    description: 'Share the models you use for planning, building, and debugging.',
    images: [
      {
        url: `${getImageBaseUrl()}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'mymodels.dev',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} touch-manipulation font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="focus:bg-foreground focus:text-background focus:ring-ring focus: sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-6 focus:z-50 focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
        >
          Skip to main content
        </a>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
