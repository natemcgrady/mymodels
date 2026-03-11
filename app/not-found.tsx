import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="bg-background text-foreground flex min-h-screen items-center justify-center px-4 py-12 sm:px-6"
    >
      <div className="border-border bg-card flex w-full max-w-lg flex-col items-start gap-4 border p-6 sm:p-8">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">Page not found</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            This route does not exist. If you were looking for sign in, use the dedicated auth
            route below.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="border-border bg-foreground text-background hover:opacity-90 focus-visible:ring-ring border px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none"
          >
            Go home
          </Link>
          <Link
            href="/auth/signin"
            className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring border px-4 py-2 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
