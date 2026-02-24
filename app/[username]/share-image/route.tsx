import { ImageResponse } from 'next/og'
import { getProfileEditorOption } from '@/lib/profile-editors'
import { PROFILE_SLOT_CONFIG } from '@/lib/profile-slots'
import { getProviderBrand } from '@/lib/provider-brand'
import { getProfileByUsername, getProfileSelections } from '@/server/data/profiles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WIDTH = 1200
const HEIGHT = 675

const FONT_SANS =
  'Geist, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif'
const FONT_PIXEL =
  '"Geist Pixel Square", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

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
  const slots = PROFILE_SLOT_CONFIG.map(({ id, label }) => ({
    label,
    model: selections[id],
  })).filter((slot): slot is { label: string; model: NonNullable<(typeof selections)[keyof typeof selections]> } =>
    Boolean(slot.model)
  )
  const selectedMainEditor = getProfileEditorOption(profile.mainEditor ?? null)
  const isDenseLayout = slots.length + (selectedMainEditor ? 1 : 0) > 5
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const theme = requestUrl.searchParams.get('theme') === 'light' ? 'light' : 'dark'
  const palette =
    theme === 'dark'
      ? {
          pageBg: '#262624',
          cardBg: '#262624',
          border: '#3e3e38',
          rowBg: '#262624',
          text: '#c3c0b6',
          mutedText: '#b7b5a9',
          primary: '#00bba7',
          avatarFallbackBg: '#1b1b19',
        }
      : {
          pageBg: '#faf9f5',
          cardBg: '#faf9f5',
          border: '#dad9d4',
          rowBg: '#faf9f5',
          text: '#3d3929',
          mutedText: '#83827d',
          primary: '#00786f',
          avatarFallbackBg: '#ede9de',
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
        fontFamily: FONT_SANS,
      }}
    >
      <div
        style={{
          width: WIDTH,
          backgroundColor: palette.cardBg,
          display: 'flex',
          flexDirection: 'column',
          padding: 56,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 32,
            right: 40,
            fontSize: 28,
            fontWeight: 700,
            color: palette.primary,
            fontFamily: FONT_PIXEL,
            letterSpacing: '0.04em',
          }}
        >
          mymodels.dev/{normalizedUsername}
        </div>
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
                objectFit: 'cover',
                border: `1px solid ${palette.border}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 128,
                height: 128,
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
                fontFamily: FONT_PIXEL,
              }}
            >
              @{profile.username}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: isDenseLayout ? 30 : 48,
            borderTop: `1px solid ${palette.border}`,
            paddingTop: isDenseLayout ? 20 : 34,
            display: 'flex',
            flexDirection: 'column',
            gap: isDenseLayout ? 10 : 18,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: isDenseLayout ? 18 : 22,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              opacity: 0.72,
              color: palette.mutedText,
              fontFamily: FONT_PIXEL,
            }}
          >
            Currently using
          </div>

          {selectedMainEditor ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: `1px solid ${palette.border}`,
                backgroundColor: palette.rowBg,
                padding: isDenseLayout ? '10px 14px' : '20px 24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: isDenseLayout ? 15 : 21,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  opacity: 0.75,
                  color: palette.mutedText,
                  fontFamily: FONT_PIXEL,
                }}
              >
                Main editor
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontSize: isDenseLayout ? 20 : 28,
                  lineHeight: 1,
                  color: palette.text,
                  fontFamily: FONT_PIXEL,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isDenseLayout ? 20 : 32,
                    height: isDenseLayout ? 20 : 32,
                    marginRight: isDenseLayout ? 8 : 14,
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${origin}${selectedMainEditor.logoPath}`}
                    alt={selectedMainEditor.label}
                    width={isDenseLayout ? 20 : 32}
                    height={isDenseLayout ? 20 : 32}
                    style={{
                      width: isDenseLayout ? 20 : 32,
                      height: isDenseLayout ? 20 : 32,
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <span style={{ display: 'flex', alignItems: 'center' }}>{selectedMainEditor.label}</span>
              </div>
            </div>
          ) : null}

          {slots.map(({ label, model }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: `1px solid ${palette.border}`,
                backgroundColor: palette.rowBg,
                padding: isDenseLayout ? '10px 14px' : '20px 24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: isDenseLayout ? 15 : 21,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  opacity: 0.75,
                  color: palette.mutedText,
                  fontFamily: FONT_PIXEL,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontSize: isDenseLayout ? 20 : 28,
                  lineHeight: 1,
                  color: palette.text,
                  fontFamily: FONT_PIXEL,
                }}
              >
                {getProviderBrand(model.provider)?.logoPath ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: isDenseLayout ? 20 : 32,
                      height: isDenseLayout ? 20 : 32,
                      marginRight: isDenseLayout ? 8 : 14,
                      flexShrink: 0,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${origin}${getProviderBrand(model.provider)?.logoPath}`}
                      alt={model.provider}
                      width={isDenseLayout ? 20 : 32}
                      height={isDenseLayout ? 20 : 32}
                      style={{
                        width: isDenseLayout ? 20 : 32,
                        height: isDenseLayout ? 20 : 32,
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                ) : null}
                <span style={{ display: 'flex', alignItems: 'center' }}>{model.name}</span>
              </div>
            </div>
          ))}
          {slots.length === 0 && !selectedMainEditor ? (
            <div
              style={{
                display: 'flex',
                border: `1px solid ${palette.border}`,
                backgroundColor: palette.rowBg,
                padding: '12px 16px',
                color: palette.mutedText,
                fontSize: 22,
                fontFamily: FONT_PIXEL,
              }}
            >
              No categories selected yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
    }
  )
}
