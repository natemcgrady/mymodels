import Link from 'next/link'
import { UserButton } from '@/components/auth/user-button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function SiteHeader() {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-pixel text-foreground focus-visible:ring-ring text-sm tracking-[0.22em] uppercase transition-opacity hover:opacity-80 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            MyModels.dev
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  )
}
