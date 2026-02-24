import { ImageResponse } from 'next/og'
import { getProfileEditorOption } from '@/lib/profile-editors'
import { PROFILE_SLOT_CONFIG } from '@/lib/profile-slots'
import { getProviderBrand } from '@/lib/provider-brand'
import { getProfileByUsername, getProfileSelections } from '@/server/data/profiles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const WIDTH = 1200
const HEIGHT = 630

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
  const allSlots = PROFILE_SLOT_CONFIG.map(({ id, label }) => ({
    label,
    model: selections[id],
  })).filter(
    (
      slot
    ): slot is {
      label: string
      model: NonNullable<(typeof selections)[keyof typeof selections]>
    } => Boolean(slot.model)
  )
  const slots = allSlots.slice(0, 6)
  const selectedMainEditor = getProfileEditorOption(profile.mainEditor ?? null)
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  type ShareRowItem = { label: string; value: string; iconPath?: string; iconAlt?: string }
  const rowItems: ShareRowItem[] = []

  if (selectedMainEditor) {
    rowItems.push({
      label: 'Main editor',
      value: selectedMainEditor.label,
      iconPath: `${origin}${selectedMainEditor.logoPath}`,
      iconAlt: selectedMainEditor.label,
    })
  }

  for (const { label, model } of slots) {
    const providerBrand = getProviderBrand(model.provider)
    rowItems.push({
      label,
      value: model.name,
      iconPath: providerBrand?.logoPath ? `${origin}${providerBrand.logoPath}` : undefined,
      iconAlt: model.provider,
    })
  }
  const visibleRowItems = rowItems.slice(0, 4)
  const rowCount = visibleRowItems.length
  const isCompactLayout = rowCount >= 6
  const isMidLayout = rowCount === 5
  const avatarSize = isCompactLayout ? 90 : isMidLayout ? 98 : 112
  const nameSize = isCompactLayout ? 44 : isMidLayout ? 48 : 54
  const handleSize = isCompactLayout ? 16 : 18
  const rowGap = isCompactLayout ? 8 : isMidLayout ? 10 : 12
  const rowPaddingY = isCompactLayout ? 8 : isMidLayout ? 10 : 12
  const rowPaddingX = isCompactLayout ? 12 : 16
  const rowLabelSize = isCompactLayout ? 13 : 15
  const rowValueSize = isCompactLayout ? 18 : isMidLayout ? 21 : 24
  const rowIconSize = isCompactLayout ? 18 : 22
  const sectionTopSpacing = isCompactLayout ? 16 : 22
  const sectionPaddingTop = isCompactLayout ? 14 : 20
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
        width: WIDTH,
        height: HEIGHT,
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
          width: '100%',
          height: '100%',
          backgroundColor: palette.cardBg,
          display: 'flex',
          flexDirection: 'column',
          padding: 40,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 24,
            right: 36,
            fontSize: 24,
            fontWeight: 700,
            color: palette.primary,
            fontFamily: FONT_PIXEL,
            letterSpacing: '0.04em',
          }}
        >
          mymodels.dev/{normalizedUsername}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          {avatarSource ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSource}
              alt={displayName}
              width={avatarSize}
              height={avatarSize}
              style={{
                width: avatarSize,
                height: avatarSize,
                objectFit: 'cover',
                border: `1px solid ${palette.border}`,
              }}
            />
          ) : (
            <div
              style={{
                width: avatarSize,
                height: avatarSize,
                border: `1px solid ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isCompactLayout ? 36 : 42,
                fontWeight: 700,
                color: palette.text,
                backgroundColor: palette.avatarFallbackBg,
                textTransform: 'uppercase',
              }}
            >
              {(displayName[0] ?? '?').toUpperCase()}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
              style={{
                display: 'flex',
                fontSize: nameSize,
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
                fontSize: handleSize,
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
            marginTop: sectionTopSpacing,
            borderTop: `1px solid ${palette.border}`,
            paddingTop: sectionPaddingTop,
            display: 'flex',
            flexDirection: 'column',
            gap: rowGap,
            flex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: isCompactLayout ? 14 : 17,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              opacity: 0.72,
              color: palette.mutedText,
              fontFamily: FONT_PIXEL,
            }}
          >
            Currently using
          </div>
          {visibleRowItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: rowGap, flex: 1, minHeight: 0 }}>
              {visibleRowItems.map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: `1px solid ${palette.border}`,
                    backgroundColor: palette.rowBg,
                    padding: `${rowPaddingY}px ${rowPaddingX}px`,
                    minHeight: isCompactLayout ? 44 : 52,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: rowLabelSize,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      opacity: 0.75,
                      color: palette.mutedText,
                      fontFamily: FONT_PIXEL,
                    }}
                  >
                    {row.label}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      maxWidth: '66%',
                      fontSize: rowValueSize,
                      lineHeight: 1,
                      color: palette.text,
                      fontFamily: FONT_PIXEL,
                    }}
                  >
                    {row.iconPath ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: rowIconSize,
                          height: rowIconSize,
                          marginRight: 10,
                          flexShrink: 0,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={row.iconPath}
                          alt={row.iconAlt ?? row.label}
                          width={rowIconSize}
                          height={rowIconSize}
                          style={{
                            width: rowIconSize,
                            height: rowIconSize,
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                    ) : null}
                    <span style={{ display: 'flex', alignItems: 'center' }}>{row.value}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                border: `1px solid ${palette.border}`,
                backgroundColor: palette.rowBg,
                padding: '10px 14px',
                color: palette.mutedText,
                fontSize: 18,
                fontFamily: FONT_PIXEL,
              }}
            >
              No categories selected yet.
            </div>
          )}
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
    }
  )
}
