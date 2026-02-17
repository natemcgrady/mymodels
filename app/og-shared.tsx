import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { decompress } from 'wawoff2'

export const ogSize = {
  width: 1200,
  height: 630,
}

export async function generateOgImage(size: { width: number; height: number }) {
  const geistSemiBold = await readFile(
    join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf')
  )
  const geistRegular = await readFile(
    join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf')
  )
  const geistPixelWoff2 = await readFile(
    join(process.cwd(), 'node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2')
  )
  const geistPixel = Buffer.from(await decompress(geistPixelWoff2))

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 100px',
        backgroundColor: '#2d2b28',
        position: 'relative',
      }}
    >
      <p
        style={{
          fontFamily: 'GeistPixel',
          fontSize: 24,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#c9795a',
          marginBottom: 40,
        }}
      >
        Build your AI stack card
      </p>

      <h1
        style={{
          fontFamily: 'GeistSans',
          fontWeight: 600,
          fontSize: 84,
          lineHeight: 1.15,
          color: '#faf5ee',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          marginBottom: 40,
        }}
      >
        <span>How do you </span>
        <span
          style={{
            fontFamily: 'GeistPixel',
            color: '#c9795a',
          }}
        >
          build
        </span>
        <span>?</span>
      </h1>

      <p
        style={{
          fontFamily: 'GeistSans',
          fontWeight: 400,
          fontSize: 28,
          lineHeight: 1.6,
          color: '#b8b3ac',
          maxWidth: 800,
        }}
      >
        Create your model stack profile and share it with your friends and so they always know what
        models you&apos;re using to plan, build, and debug.
      </p>

      <p
        style={{
          fontFamily: 'GeistPixel',
          fontSize: 20,
          color: '#faf5ee',
          position: 'absolute',
          bottom: 50,
          right: 100,
          opacity: 0.6,
        }}
      >
        mymodels.dev
      </p>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'GeistSans',
          data: geistSemiBold,
          weight: 600,
          style: 'normal',
        },
        {
          name: 'GeistSans',
          data: geistRegular,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'GeistPixel',
          data: geistPixel,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  )
}
