'use client'

import { useQuery } from '@tanstack/react-query'
import { type ProfileEditor } from '@/lib/profile-editors'
import {
  PROFILE_SLOT_CONFIG,
  PROFILE_SLOT_VALUES,
  type ProfileSlotRecord,
} from '@/lib/profile-slots'
import { ModelSelectionForm } from '@/components/model-selection-form'
import { Button } from '@/components/ui/button'

type ModelSelections = ProfileSlotRecord<number | null>

type ProfileEditorGateProps = {
  username: string
  initialSelections: ModelSelections
  initialMainEditor: ProfileEditor | null
  onSave?: (nextSelections?: ModelSelections) => void
  onCancel?: () => void
}

type CatalogModel = {
  id: number
  provider: string
  name: string
}

type EditorDataResponse = {
  canEdit: boolean
  catalog: CatalogModel[]
  mainEditor: ProfileEditor | null
}

const initialSelectionsKey = (s: ProfileEditorGateProps['initialSelections']) =>
  PROFILE_SLOT_VALUES.map((slot) => s[slot] ?? '').join('-')

export function ProfileEditorGate({
  username,
  initialSelections,
  initialMainEditor,
  onSave,
  onCancel,
}: ProfileEditorGateProps) {
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
          {PROFILE_SLOT_CONFIG.map((slot) => (
            <li
              key={slot.id}
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

  const resolvedMainEditor =
    typeof data.mainEditor === 'string'
      ? data.mainEditor
      : data.mainEditor === null
        ? null
        : initialMainEditor

  return (
    <ModelSelectionForm
      key={`${initialSelectionsKey(initialSelections)}-${resolvedMainEditor ?? ''}`}
      username={username}
      catalog={data.catalog}
      initialSelections={initialSelections}
      initialMainEditor={resolvedMainEditor}
      onSave={onSave}
      onCancel={onCancel}
    />
  )
}
