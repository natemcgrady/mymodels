'use client'

import Image from 'next/image'
import { Check, ChevronDown, Copy, Github, Loader2, Share2 } from 'lucide-react'
import { cloneElement, isValidElement, type ReactNode, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getProfileEditorOption, type ProfileEditor } from '@/lib/profile-editors'
import { getProviderBrand } from '@/lib/provider-brand'

type ModelSlot = {
  slot: string
  model: {
    name: string
    provider: string
  } | null
}

type ProfileCardProps = {
  profile: {
    displayName: string
    username: string
    image: string | null
    githubUrl?: string | null
    twitterUrl?: string | null
    mainEditor?: ProfileEditor | null
  }
  modelSlots: ModelSlot[]
  modelEditor?: ReactNode
}

export function ProfileCard({ profile, modelSlots, modelEditor }: ProfileCardProps) {
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { resolvedTheme } = useTheme()
  const { data: editorPermission } = useQuery({
    queryKey: ['profile', 'editor-data', profile.username],
    queryFn: async () => {
      const response = await fetch(
        `/api/v1/profiles/${encodeURIComponent(profile.username)}/permissions`
      )
      if (!response.ok) {
        throw new Error('Could not load editor data')
      }
      return (await response.json()) as { data?: { canEdit?: boolean } }
    },
    enabled: Boolean(modelEditor),
    staleTime: 1000 * 60 * 5,
  })
  const canEditProfile = Boolean(modelEditor && editorPermission?.data?.canEdit)
  const populatedModelSlots = modelSlots.filter(
    (slot): slot is ModelSlot & { model: NonNullable<ModelSlot['model']> } => Boolean(slot.model)
  )
  const selectedMainEditor = getProfileEditorOption(profile.mainEditor)
  const mainEditorLabel = selectedMainEditor?.label ?? 'Not selected yet'
  const renderedModelEditor = isValidElement<{ onSave?: () => void; onCancel?: () => void }>(modelEditor)
    ? cloneElement(modelEditor, {
        onSave: () => setIsEditing(false),
        onCancel: () => setIsEditing(false),
      })
    : modelEditor

  const copyAsPng = async () => {
    if (isCopying) {
      return
    }

    setIsCopying(true)

    try {
      const theme = resolvedTheme === 'light' ? 'light' : 'dark'
      const response = await fetch(
        `/${profile.username}/share-image?theme=${theme}&cb=${Date.now()}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      )
      if (!response.ok) {
        throw new Error('Could not render profile card image.')
      }

      const blob = await response.blob()
      if (!blob) {
        throw new Error('Could not render card image.')
      }

      if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
        throw new Error('Clipboard image copy is not supported in this browser.')
      }

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ])

      toast.success('Profile card copied as PNG.')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not copy profile card right now. Please try again.'
      toast.error(message)
    } finally {
      setIsShareMenuOpen(false)
      setIsCopying(false)
    }
  }

  const shareToTwitter = () => {
    const url = new URL('https://twitter.com/intent/tweet')
    url.searchParams.set('text', `Check out ${profile.displayName}'s AI stack`)
    url.searchParams.set('url', `${window.location.origin}/${profile.username}`)
    window.open(url.toString(), '_blank', 'noopener,noreferrer')
    setIsShareMenuOpen(false)
  }

  useEffect(() => {
    if (!canEditProfile && isEditing) {
      setIsEditing(false)
    }
  }, [canEditProfile, isEditing])

  useEffect(() => {
    if (!isShareMenuOpen) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsShareMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [isShareMenuOpen])

  return (
    <div className="w-full pb-1">
      <section className="relative mx-auto w-full max-w-[720px]">
        <div className="absolute top-4 right-4 z-10" data-capture-exclude="true" ref={shareMenuRef}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5"
            disabled={isCopying}
            onClick={() => setIsShareMenuOpen((current) => !current)}
            aria-label="Open share menu"
            aria-haspopup="menu"
            aria-expanded={isShareMenuOpen}
          >
            <Share2 className="size-4" aria-hidden />
            Share
            <ChevronDown className="size-4" aria-hidden />
          </Button>

          {isShareMenuOpen ? (
            <div
              role="menu"
              className="border-border bg-popover absolute right-0 mt-2 w-52 max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain border p-1.5 shadow-md"
            >
              <button
                type="button"
                role="menuitem"
                onClick={copyAsPng}
                disabled={isCopying}
                className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex w-full items-center justify-between px-2 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Copy className="size-4 shrink-0" aria-hidden />
                  Copy as PNG
                </span>
                {isCopying ? (
                  <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <Check className="size-4 shrink-0 opacity-0" aria-hidden />
                )}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={shareToTwitter}
                disabled={isCopying}
                className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex w-full items-center gap-2 px-2 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
                  <path d="M18.901 1.153h3.68l-8.04 9.19 9.458 12.504h-7.406l-5.8-7.584-6.64 7.584H.472l8.6-9.826L0 1.153h7.594l5.243 6.932zm-1.292 19.49h2.04L6.486 3.24H4.298z" />
                </svg>
                Share to Twitter
              </button>
            </div>
          ) : null}
        </div>

        <div className="border-border bg-card w-full border p-4 sm:p-6 md:p-8">
          <div className="grid min-w-0 grid-cols-[auto_1fr] gap-3 sm:gap-4">
            <div
              className={`relative flex min-w-12 items-center justify-center overflow-hidden rounded-full sm:min-w-16 ${!profile.image ? 'bg-muted' : ''}`}
              style={{ aspectRatio: 1, height: '100%', width: 'auto' }}
            >
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.displayName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="text-foreground text-lg font-semibold sm:text-xl">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-foreground text-xl font-semibold text-balance sm:text-2xl">
                {profile.displayName}
              </h1>
              <p className="text-muted-foreground truncate text-[10px] tracking-[0.14em] uppercase sm:text-[11px] sm:tracking-[0.16em]">
                @{profile.username}
              </p>
              {profile.githubUrl || profile.twitterUrl ? (
                <div className="mt-2 flex items-center gap-3">
                  {profile.githubUrl ? (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-sm"
                      aria-label={`${profile.displayName}'s GitHub profile`}
                    >
                      <Github className="size-3.5 sm:size-4" aria-hidden />
                    </a>
                  ) : null}
                  {profile.twitterUrl ? (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none sm:text-sm"
                      aria-label={`${profile.displayName}'s X profile`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="size-3.5 fill-current sm:size-4"
                      >
                        <path d="M18.901 1.153h3.68l-8.04 9.19 9.458 12.504h-7.406l-5.8-7.584-6.64 7.584H.472l8.6-9.826L0 1.153h7.594l5.243 6.932zm-1.292 19.49h2.04L6.486 3.24H4.298z" />
                      </svg>
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="border-border mt-6 border-t pt-4 sm:mt-8 sm:pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase sm:text-sm sm:tracking-[0.16em]">
                Currently using
              </h2>
              {modelEditor && canEditProfile && !isEditing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  data-capture-exclude="true"
                >
                  Edit
                </Button>
              ) : null}
            </div>

            {isEditing && renderedModelEditor ? (
              <div className="mt-4" data-capture-exclude="true">
                {renderedModelEditor}
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                <li className="border-border bg-background flex min-w-0 items-center justify-between gap-2 border px-3 py-2.5 sm:px-4 sm:py-3">
                  <span className="text-muted-foreground shrink-0 text-[10px] tracking-[0.12em] uppercase sm:text-[11px] sm:tracking-[0.14em]">
                    Main editor
                  </span>
                  <span className="text-foreground flex min-w-0 items-center gap-2 text-xs sm:text-sm">
                    {selectedMainEditor ? (
                      <Image
                        src={selectedMainEditor.logoPath}
                        alt={selectedMainEditor.label}
                        width={20}
                        height={20}
                        sizes="20px"
                        className="size-4 shrink-0 sm:size-5"
                      />
                    ) : null}
                    <span className="min-w-0 truncate">{mainEditorLabel}</span>
                  </span>
                </li>
                {populatedModelSlots.map(({ slot, model }) => {
                  const providerBrand = model ? getProviderBrand(model.provider) : null

                  return (
                    <li
                      key={slot}
                      className="border-border bg-background flex min-w-0 items-center justify-between gap-2 border px-3 py-2.5 sm:px-4 sm:py-3"
                    >
                      <span className="text-muted-foreground shrink-0 text-[10px] tracking-[0.12em] uppercase sm:text-[11px] sm:tracking-[0.14em]">
                        {slot}
                      </span>
                      <span className="text-foreground flex min-w-0 items-center gap-2 text-xs sm:text-sm">
                        {providerBrand?.logoPath ? (
                          <Image
                            src={providerBrand.logoPath}
                            alt={model.provider}
                            width={20}
                            height={20}
                            sizes="20px"
                            className="size-4 shrink-0 sm:size-5"
                          />
                        ) : null}
                        <span className="min-w-0 truncate">{model.name}</span>
                      </span>
                    </li>
                  )
                })}
                {populatedModelSlots.length === 0 ? (
                  <li className="text-muted-foreground border-border bg-background border px-3 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm">
                    No categories selected yet.
                  </li>
                ) : null}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
