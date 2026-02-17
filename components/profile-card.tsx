'use client'

import Image from 'next/image'
import { Check, ChevronDown, Copy, Loader2, Share2 } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getProviderBrand } from '@/lib/provider-brand'

type ModelSlot = {
  slot: 'Plan' | 'Build' | 'Debug'
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
  }
  modelSlots: ModelSlot[]
  modelEditor?: ReactNode
}

export function ProfileCard({ profile, modelSlots, modelEditor }: ProfileCardProps) {
  const shareMenuRef = useRef<HTMLDivElement>(null)
  const [isCopying, setIsCopying] = useState(false)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const copyAsPng = async () => {
    if (isCopying) {
      return
    }

    setIsCopying(true)
    setIsShareMenuOpen(false)

    try {
      const response = await fetch(`/${profile.username}/share-image?cb=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
      })
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
              className="border-border bg-popover absolute right-0 mt-2 w-52 overflow-y-auto overscroll-contain rounded-md border p-1.5 shadow-md"
            >
              <button
                type="button"
                role="menuitem"
                onClick={copyAsPng}
                disabled={isCopying}
                className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
                className="text-popover-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
                  <path d="M18.901 1.153h3.68l-8.04 9.19 9.458 12.504h-7.406l-5.8-7.584-6.64 7.584H.472l8.6-9.826L0 1.153h7.594l5.243 6.932zm-1.292 19.49h2.04L6.486 3.24H4.298z" />
                </svg>
                Share to Twitter
              </button>
            </div>
          ) : null}
        </div>

        <div className="border-border bg-card w-full rounded-2xl border p-4 sm:p-6 md:p-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.displayName}
                width={64}
                height={64}
                className="border-border h-12 w-12 rounded-full border object-cover sm:h-16 sm:w-16"
              />
            ) : (
              <div className="border-border bg-muted text-foreground flex h-12 w-12 items-center justify-center rounded-full border text-lg font-semibold sm:h-16 sm:w-16 sm:text-xl">
                {profile.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-foreground text-xl font-semibold text-balance sm:text-2xl">
                {profile.displayName}
              </h1>
              <p className="font-pixel text-muted-foreground truncate text-[10px] tracking-[0.14em] uppercase sm:text-[11px] sm:tracking-[0.16em]">
                @{profile.username}
              </p>
            </div>
          </div>

          <div className="border-border mt-6 border-t pt-4 sm:mt-8 sm:pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase sm:text-sm sm:tracking-[0.16em]">
                Currently using
              </h2>
              {modelEditor ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing((current) => !current)}
                  data-capture-exclude="true"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              ) : null}
            </div>

            {isEditing && modelEditor ? (
              <div className="mt-4" data-capture-exclude="true">
                {modelEditor}
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {modelSlots.map(({ slot, model }) => {
                  const providerBrand = model ? getProviderBrand(model.provider) : null

                  return (
                    <li
                      key={slot}
                      className="border-border bg-background flex min-w-0 items-center justify-between gap-2 rounded-lg border px-3 py-2.5 sm:px-4 sm:py-3"
                    >
                      <span className="font-pixel text-muted-foreground shrink-0 text-[10px] tracking-[0.12em] uppercase sm:text-[11px] sm:tracking-[0.14em]">
                        {slot}
                      </span>
                      {model ? (
                        <span className="text-foreground flex min-w-0 items-center gap-2 text-xs sm:text-sm">
                          {providerBrand?.logoPath ? (
                            <Image
                              src={providerBrand.logoPath}
                              alt={model.provider}
                              width={20}
                              height={20}
                              className="size-4 shrink-0 sm:size-5"
                            />
                          ) : null}
                          <span className="min-w-0 truncate">
                            {model.name}
                            <span className="text-muted-foreground"> ({model.provider})</span>
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs sm:text-sm">
                          Not selected
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
