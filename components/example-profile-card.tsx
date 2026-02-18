import Image from 'next/image'
import { User } from 'lucide-react'

export type ModelPreviewRow = {
  label: 'Plan' | 'Build' | 'Debug'
  value: string
}

export function ExampleProfileCard({
  isLoggedIn,
  profile,
  modelRows,
}: {
  isLoggedIn: boolean
  profile: {
    displayName: string
    username: string
    image: string | null
  }
  modelRows: ModelPreviewRow[]
}) {
  return (
    <article className="border-border/85 bg-background/85 relative overflow-hidden border p-4 shadow-md sm:p-6">
      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {isLoggedIn ? (
              profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.displayName}
                  width={56}
                  height={56}
                  className="border-border h-12 w-12 border object-cover sm:h-14 sm:w-14"
                />
              ) : (
                <div className="border-border bg-muted text-foreground flex h-12 w-12 items-center justify-center border text-base font-semibold sm:h-14 sm:w-14 sm:text-lg">
                  {profile.displayName.slice(0, 1).toUpperCase()}
                </div>
              )
            ) : (
              <div className="border-border bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center border sm:h-14 sm:w-14">
                <User className="size-4" aria-hidden />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-foreground truncate text-base font-semibold sm:text-lg">
                {profile.displayName}
              </p>
              <p className="font-pixel text-muted-foreground truncate text-[10px] tracking-[0.16em] uppercase sm:text-[11px]">
                @{profile.username}
              </p>
            </div>
          </div>
          <span className="font-pixel text-primary shrink-0 text-[10px] tracking-[0.18em] uppercase sm:text-[11px]">
            {isLoggedIn ? 'Live preview' : 'Example profile'}
          </span>
        </div>

        <div className="space-y-2.5">
          {modelRows.map((row) => (
            <div
              key={row.label}
              className="border-border bg-card/80 flex min-w-0 items-center justify-between gap-4 border px-3 py-2.5 sm:px-4 sm:py-3"
            >
              <span className="font-pixel text-muted-foreground shrink-0 text-[10px] tracking-[0.15em] uppercase sm:text-[11px]">
                {row.label}
              </span>
              <span className="text-foreground min-w-0 truncate text-right text-xs font-medium sm:text-sm">
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {!isLoggedIn ? (
          <p className="text-muted-foreground text-xs sm:text-sm">
            Sign in to replace this example with your real avatar and model stack.
          </p>
        ) : null}
      </div>
    </article>
  )
}
