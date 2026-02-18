import { ImageResponse } from 'next/og'

export const alt = 'mymodels.dev'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        color: '#111111',
        fontSize: 96,
        fontFamily: 'sans-serif',
        letterSpacing: '-0.02em',
      }}
    >
      mymodels.dev
    </div>
  )
}
