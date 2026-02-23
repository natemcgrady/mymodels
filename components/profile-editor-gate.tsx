'use client'

import { useQuery } from '@tanstack/react-query'
import { ModelSelectionForm } from '@/components/model-selection-form'
import { Button } from '@/components/ui/button'

type ProfileEditorGateProps = {
  username: string
  initialSelections: {
    plan: number | null
    build: number | null
    debug: number | null
  }
  onSave?: (nextSelections?: {
    plan: number | null
    build: number | null
    debug: number | null
  }) => void
}

type CatalogModel = {
  id: number
  provider: string
  name: string
}

type EditorDataResponse = {
  canEdit: boolean
  catalog: CatalogModel[]
}

const initialSelectionsKey = (s: ProfileEditorGateProps['initialSelections']) =>
  `${s.plan}-${s.build}-${s.debug}`

export function ProfileEditorGate({ username, initialSelections, onSave }: ProfileEditorGateProps) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['profile', 'editor-data', username],
    queryFn: async () => {
      const response = await fetch(`/api/profile/editor?username=${encodeURIComponent(username)}`)
      if (!response.ok) {
        throw new Error('Could not load editor data')
      }
      return (await response.json()) as EditorDataResponse
    },
    staleTime: 1000 * 60 * 5,
  })

  if (isPending) {
    return (
      <div className="space-y-3" aria-live="polite" aria-busy="true">
        <p className="text-muted-foreground text-xs sm:text-sm">Loading model editor…</p>
        <ul className="space-y-3">
          {['plan', 'build', 'debug'].map((slot) => (
            <li
              key={slot}
              className="border-border/70 bg-background/70 flex items-center justify-between gap-3 border px-3 py-3 sm:px-4"
            >
              <div className="bg-muted h-3 w-14 animate-pulse rounded" />
              <div className="bg-muted h-9 w-full max-w-[430px] animate-pulse rounded sm:h-10" />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-border/70 bg-background/70 space-y-3 border px-3 py-3 sm:px-4">
        <p className="text-muted-foreground text-xs sm:text-sm">
          We could not load your model catalog. Please try again.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!data?.canEdit) {
    return (
      <div className="border-border/70 bg-background/70 border px-3 py-3 sm:px-4">
        <p className="text-muted-foreground text-xs sm:text-sm">
          You can only edit model selections on your own profile.
        </p>
      </div>
    )
  }

  return (
    <ModelSelectionForm
      key={initialSelectionsKey(initialSelections)}
      username={username}
      catalog={data.catalog}
      initialSelections={initialSelections}
      onSave={onSave}
    />
  )
}
