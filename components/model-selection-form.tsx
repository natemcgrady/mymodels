'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { updateProfileModels } from '@/app/[username]/actions'
import { Button } from '@/components/ui/button'
import {
  createProfileSlotRecord,
  PROFILE_SLOT_CONFIG,
  PROFILE_SLOT_VALUES,
  type ProfileSlotRecord,
} from '@/lib/profile-slots'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CatalogModel = {
  id: number
  provider: string
  name: string
}

type ModelSelections = ProfileSlotRecord<number | null>

type ModelSelectionFormProps = {
  username: string
  catalog: CatalogModel[]
  initialSelections: ModelSelections
  onSave?: (nextSelections?: ModelSelections) => void
}

function groupByProvider(catalog: CatalogModel[]) {
  return catalog.reduce<Record<string, CatalogModel[]>>((acc, model) => {
    const bucket = acc[model.provider] ?? []
    bucket.push(model)
    acc[model.provider] = bucket
    return acc
  }, {})
}

function parseSelectionId(value: string) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? 'Saving…' : 'Save selections'}
    </Button>
  )
}

export function ModelSelectionForm({
  username,
  catalog,
  initialSelections,
  onSave,
}: ModelSelectionFormProps) {
  const catalogByProvider = useMemo(() => groupByProvider(catalog), [catalog])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [values, setValues] = useState<ProfileSlotRecord<string>>(() =>
    createProfileSlotRecord((slot) =>
      initialSelections[slot] ? String(initialSelections[slot]) : ''
    )
  )
  const hasChanges = PROFILE_SLOT_VALUES.some(
    (slot) => values[slot] !== (initialSelections[slot] ? String(initialSelections[slot]) : '')
  )

  return (
    <form
      action={async (formData) => {
        setSubmitError(null)
        try {
          await updateProfileModels(formData)
          onSave?.(createProfileSlotRecord((slot) => parseSelectionId(values[slot])))
        } catch (error) {
          setSubmitError(error instanceof Error ? error.message : 'Could not save selections.')
        }
      }}
      className="space-y-3"
    >
      <input type="hidden" name="username" value={username} />
      {PROFILE_SLOT_VALUES.map((slot) => (
        <input key={slot} type="hidden" name={slot} value={values[slot]} />
      ))}

      <ul className="space-y-3">
        {PROFILE_SLOT_CONFIG.map((slot) => {
          const value = values[slot.id]

          return (
            <li
              key={slot.id}
              className="border-border/70 bg-background/70 flex flex-col items-stretch gap-2 border px-3 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4"
            >
              <Label
                htmlFor={slot.id}
                className="font-pixel text-muted-foreground/90 text-[10px] tracking-[0.12em] uppercase sm:text-[11px] sm:tracking-[0.14em]"
              >
                {slot.label}
              </Label>

              <Select
                name={`${slot.id}-select`}
                value={value || '__none__'}
                onValueChange={(nextValue) =>
                  setValues((current) => ({
                    ...current,
                    [slot.id]: nextValue === '__none__' ? '' : nextValue,
                  }))
                }
              >
                <SelectTrigger
                  id={slot.id}
                  className="border-border/70 bg-card/75 text-foreground hover:border-border focus-visible:ring-ring w-full shadow-none transition-[border-color,background-color] duration-200 focus-visible:ring-1 sm:max-w-[430px]"
                >
                  <SelectValue placeholder="Choose a model…" />
                </SelectTrigger>
                <SelectContent
                  className="border-border/80 bg-card/95 backdrop-blur-md"
                  position="popper"
                >
                  <SelectGroup>
                    <SelectLabel>Clear selection</SelectLabel>
                    <SelectItem value="__none__">No selection</SelectItem>
                  </SelectGroup>
                  {Object.entries(catalogByProvider).map(([provider, models]) => (
                    <SelectGroup key={provider}>
                      <SelectLabel>{provider}</SelectLabel>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={String(model.id)}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </li>
          )
        })}
      </ul>

      <div className="space-y-2 pt-1">
        {submitError ? (
          <p className="text-destructive text-xs sm:text-sm" role="alert">
            {submitError}
          </p>
        ) : null}
        <SaveButton disabled={!hasChanges} />
        {!hasChanges ? (
          <p className="text-muted-foreground text-xs">Update at least one slot to save changes.</p>
        ) : null}
      </div>
    </form>
  )
}
