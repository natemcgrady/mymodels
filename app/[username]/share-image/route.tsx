import { ImageResponse } from 'next/og'
import { getProviderBrand } from '@/lib/provider-brand'
import { getProfileByUsername, getProfileSelections } from '@/server/data/profiles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WIDTH = 1440
const HEIGHT = 900

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const normalizedUsername = username.trim()

  if (!normalizedUsername) {
    return new Response('Username is required', { status: 400 })
  }

  const profile = await getProfileByUsername(normalizedUsername)
  if (!profile) {
    return new Response('Profile not found', { status: 404 })
  }

  const selections = await getProfileSelections(profile.id)
  const slots = [
    { label: 'Plan', model: selections.plan },
    { label: 'Build', model: selections.build },
    { label: 'Debug', model: selections.debug },
  ]
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const theme = requestUrl.searchParams.get('theme') === 'light' ? 'light' : 'dark'
  const palette =
    theme === 'dark'
      ? {
          pageBg: '#0d0d0d',
          cardBg: '#141414',
          border: '#2b2b2b',
          rowBg: '#1b1b1b',
          text: '#f3f3f3',
          mutedText: '#a8a8a8',
          avatarFallbackBg: '#202020',
          iconBadgeBg: '#111111',
          iconBadgeBorder: '#333333',
        }
      : {
          pageBg: '#f5f4f1',
          cardBg: '#fbfaf8',
          border: '#dddbd4',
          rowBg: '#f1efea',
          text: '#30302b',
          mutedText: '#77756f',
          avatarFallbackBg: '#efede7',
          iconBadgeBg: '#1c1c1c',
          iconBadgeBorder: '#2f2f2f',
        }

  const displayName = profile.displayName || profile.username
  const avatarSource = profile.image?.startsWith('http') ? profile.image : null

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.pageBg,
        color: palette.text,
        padding: 64,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans',
      }}
    >
      <div
        style={{
          width: 1180,
          borderRadius: 32,
          border: `1px solid ${palette.border}`,
          backgroundColor: palette.cardBg,
          display: 'flex',
          flexDirection: 'column',
          padding: 56,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {avatarSource ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSource}
              alt={displayName}
              width={128}
              height={128}
              style={{
                width: 128,
                height: 128,
                borderRadius: '9999px',
                objectFit: 'cover',
                border: `1px solid ${palette.border}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 128,
                height: 128,
                borderRadius: '9999px',
                border: `1px solid ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 54,
                fontWeight: 700,
                color: palette.text,
                backgroundColor: palette.avatarFallbackBg,
                textTransform: 'uppercase',
              }}
            >
              {(displayName[0] ?? '?').toUpperCase()}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1.05,
                color: palette.text,
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                letterSpacing: '0.16em',
                opacity: 0.72,
                textTransform: 'uppercase',
                color: palette.mutedText,
              }}
            >
              @{profile.username}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            borderTop: `1px solid ${palette.border}`,
            paddingTop: 34,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              opacity: 0.72,
              color: palette.mutedText,
            }}
          >
            Currently using
          </div>

          {slots.map(({ label, model }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 18,
                border: `1px solid ${palette.border}`,
                backgroundColor: palette.rowBg,
                padding: '20px 24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 21,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  opacity: 0.75,
                  color: palette.mutedText,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  fontSize: 28,
                  color: palette.text,
                }}
              >
                {model ? (
                  <>
                    {getProviderBrand(model.provider)?.logoPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${origin}${getProviderBrand(model.provider)?.logoPath}`}
                        alt={model.provider}
                        width={30}
                        height={30}
                        style={{
                          width: 30,
                          height: 30,
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                    <span>{model.name}</span>
                  </>
                ) : (
                  <span style={{ color: palette.mutedText }}>Not selected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
    }
  )
}
