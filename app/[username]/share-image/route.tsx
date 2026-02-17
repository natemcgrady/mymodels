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
        backgroundColor: '#f5f4f1',
        color: '#30302b',
        padding: 64,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans',
      }}
    >
      <div
        style={{
          width: 1180,
          borderRadius: 32,
          border: '1px solid #dddbd4',
          backgroundColor: '#fbfaf8',
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
                border: '1px solid #dddbd4',
              }}
            />
          ) : (
            <div
              style={{
                width: 128,
                height: 128,
                borderRadius: '9999px',
                border: '1px solid #dddbd4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 54,
                fontWeight: 700,
                color: '#30302b',
                backgroundColor: '#efede7',
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
                color: '#30302b',
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
                color: '#77756f',
              }}
            >
              @{profile.username}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            borderTop: '1px solid #dddbd4',
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
              color: '#77756f',
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
                border: '1px solid #dddbd4',
                backgroundColor: '#f1efea',
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
                  color: '#77756f',
                }}
              >
                {label}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 28,
                  color: '#30302b',
                }}
              >
                {model ? (
                  <>
                    {getProviderBrand(model.provider)?.logoPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${origin}${getProviderBrand(model.provider)?.logoPath}`}
                        alt={model.provider}
                        width={32}
                        height={32}
                        style={{
                          width: 32,
                          height: 32,
                        }}
                      />
                    ) : null}
                    <span>{model.name}</span>
                    <span style={{ color: '#77756f' }}>({model.provider})</span>
                  </>
                ) : (
                  <span style={{ color: '#77756f' }}>Not selected</span>
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
