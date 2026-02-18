import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import { SiteHeader } from '@/components/site-header'
import { GeistSans } from 'geist/font/sans'
import { GeistPixelSquare } from 'geist/font/pixel'

const defaultMetadataBase = 'http://localhost:3000'

function resolveMetadataBase() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? defaultMetadataBase

  try {
    return new URL(appUrl)
  } catch {
    return new URL(defaultMetadataBase)
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: 'mymodels.dev',
  description: 'Share the models you use for planning, building, and debugging.',
  openGraph: {
    title: 'mymodels.dev',
    description: 'Share the models you use for planning, building, and debugging.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'mymodels.dev' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mymodels.dev',
    description: 'Share the models you use for planning, building, and debugging.',
    images: ['/opengraph-image'],
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
        className={`${GeistSans.variable} ${GeistPixelSquare.variable} touch-manipulation font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="focus:bg-foreground focus:text-background focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-6 focus:z-50 focus:rounded focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
        >
          Skip to main content
        </a>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
