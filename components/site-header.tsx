import Link from 'next/link'
import { UserButton } from '@/components/user-button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Logo } from './logo'

export function SiteHeader() {
  return (
    <header className="border-border border-b">
      <div className="flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="mymodels.dev"
            className="focus-visible:ring-ring focus-visible: flex items-center transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
          >
            <Logo size={32} />
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
