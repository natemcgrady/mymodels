'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import {
  getProfileEditorOption,
  PROFILE_EDITOR_OPTIONS,
  type ProfileEditor,
} from '@/lib/profile-editors'
import { Label } from '@/components/ui/label'
import { updateProfileModels } from '@/app/[username]/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  createProfileSlotRecord,
  PROFILE_SLOT_CONFIG,
  PROFILE_SLOT_LEADERBOARD_DESCRIPTIONS,
  PROFILE_SLOT_VALUES,
  type ProfileSlotRecord,
} from '@/lib/profile-slots'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CatalogModel = {
  id: number
  provider: string
  name: string
}

type ModelSelections = ProfileSlotRecord<number | null>
type ProviderGroup = { provider: string; models: CatalogModel[] }
const EMPTY_SELECTION_VALUE = '__none__'

type ModelSelectionFormProps = {
  username: string
  catalog: CatalogModel[]
  initialSelections: ModelSelections
  initialMainEditor: ProfileEditor | null
  onSave?: (nextSelections?: ModelSelections) => void
}

function selectionToFormValue(value: number | null | undefined) {
  return value == null ? '' : String(value)
}

function createProviderGroups(catalog: CatalogModel[]): ProviderGroup[] {
  const groups = catalog.reduce<Map<string, CatalogModel[]>>((acc, model) => {
    const bucket = acc.get(model.provider) ?? []
    bucket.push(model)
    acc.set(model.provider, bucket)
    return acc
  }, new Map())

  return Array.from(groups.entries())
    .sort(([providerA], [providerB]) => providerA.localeCompare(providerB))
    .map(([provider, models]) => ({
      provider,
      models: models.toSorted((modelA, modelB) => modelA.name.localeCompare(modelB.name)),
    }))
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
  initialMainEditor,
  onSave,
}: ModelSelectionFormProps) {
  const providerGroups = useMemo(() => createProviderGroups(catalog), [catalog])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [values, setValues] = useState<ProfileSlotRecord<string>>(() =>
    createProfileSlotRecord((slot) => selectionToFormValue(initialSelections[slot]))
  )
  const [mainEditor, setMainEditor] = useState<string>(initialMainEditor ?? '')
  const selectedMainEditor = getProfileEditorOption(mainEditor || null)
  const selectedCount = PROFILE_SLOT_VALUES.reduce(
    (count, slot) => (values[slot] ? count + 1 : count),
    0
  )
  const hasSelectedValues = selectedCount > 0
  const hasChanges =
    PROFILE_SLOT_VALUES.some(
      (slot) => values[slot] !== selectionToFormValue(initialSelections[slot])
    ) || mainEditor !== (initialMainEditor ?? '')

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
      <input type="hidden" name="mainEditor" value={mainEditor} />

      <Card className="border-border/70 bg-background/75 gap-0 overflow-hidden py-0 backdrop-blur-sm">
        <CardContent className="space-y-3 px-3 py-4 sm:px-4">
          <Card className="border-border/70 bg-card/75 gap-0 py-0 shadow-none">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="mainEditor"
                    className="font-pixel text-muted-foreground/90 text-[10px] tracking-[0.12em] uppercase sm:text-[11px] sm:tracking-[0.14em]"
                  >
                    Main editor
                  </Label>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Choose the editor you use most across your workflow.
                  </p>
                </div>
                <div className="flex w-full items-center gap-2 sm:max-w-[430px]">
                  <Select
                    value={mainEditor || EMPTY_SELECTION_VALUE}
                    onValueChange={(nextValue) =>
                      setMainEditor(nextValue === EMPTY_SELECTION_VALUE ? '' : nextValue)
                    }
                  >
                    <SelectTrigger
                      id="mainEditor"
                      className="border-border/70 bg-background/80 text-foreground hover:border-border focus-visible:ring-ring w-full shadow-none transition-[border-color,background-color] duration-200 focus-visible:ring-1"
                    >
                      {selectedMainEditor ? (
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <Image
                            src={selectedMainEditor.logoPath}
                            alt={selectedMainEditor.label}
                            width={18}
                            height={18}
                            sizes="18px"
                            className="size-[18px] shrink-0"
                          />
                          <span className="truncate">{selectedMainEditor.label}</span>
                        </span>
                      ) : (
                        <SelectValue placeholder="Choose an editor…" />
                      )}
                    </SelectTrigger>
                    <SelectContent
                      className="border-border/80 bg-card/95 backdrop-blur-md"
                      position="popper"
                    >
                      <SelectGroup>
                        <SelectLabel>Selection</SelectLabel>
                        <SelectItem value={EMPTY_SELECTION_VALUE}>No selection</SelectItem>
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel>Editors</SelectLabel>
                        {PROFILE_EDITOR_OPTIONS.map((editor) => (
                          <SelectItem key={editor.value} value={editor.value}>
                            <span className="inline-flex min-w-0 items-center gap-2">
                              <Image
                                src={editor.logoPath}
                                alt={editor.label}
                                width={16}
                                height={16}
                                sizes="16px"
                                className="size-4 shrink-0"
                              />
                              <span className="truncate">{editor.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!mainEditor}
                    onClick={() => setMainEditor('')}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <ul className="space-y-3">
            {PROFILE_SLOT_CONFIG.map((slot) => {
              const value = values[slot.id]

              return (
                <li key={slot.id}>
                  <Card className="border-border/70 bg-card/75 gap-0 py-0 shadow-none">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <Label
                            htmlFor={slot.id}
                            className="font-pixel text-muted-foreground/90 text-[10px] tracking-[0.12em] uppercase sm:text-[11px] sm:tracking-[0.14em]"
                          >
                            {slot.label}
                          </Label>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {PROFILE_SLOT_LEADERBOARD_DESCRIPTIONS[slot.id]}
                          </p>
                        </div>

                        <Select
                          value={value || EMPTY_SELECTION_VALUE}
                          onValueChange={(nextValue) =>
                            setValues((current) => ({
                              ...current,
                              [slot.id]: nextValue === EMPTY_SELECTION_VALUE ? '' : nextValue,
                            }))
                          }
                        >
                          <SelectTrigger
                            id={slot.id}
                            className="border-border/70 bg-background/80 text-foreground hover:border-border focus-visible:ring-ring w-full shadow-none transition-[border-color,background-color] duration-200 focus-visible:ring-1 sm:max-w-[430px]"
                          >
                            <SelectValue placeholder="Choose a model…" />
                          </SelectTrigger>
                          <SelectContent
                            className="border-border/80 bg-card/95 backdrop-blur-md"
                            position="popper"
                          >
                            <SelectGroup>
                              <SelectLabel>Selection</SelectLabel>
                              <SelectItem value={EMPTY_SELECTION_VALUE}>No selection</SelectItem>
                            </SelectGroup>
                            <SelectSeparator />
                            {providerGroups.map(({ provider, models }) => (
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
                      </div>
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!hasSelectedValues}
              onClick={() => setValues(createProfileSlotRecord(() => ''))}
            >
              Clear all
            </Button>
          </div>
        </CardContent>

        <CardFooter className="border-border/70 flex-col items-start gap-2 border-t px-4 py-4 sm:px-6">
          {submitError ? (
            <p className="text-destructive text-xs sm:text-sm" role="alert">
              {submitError}
            </p>
          ) : null}
          <SaveButton disabled={!hasChanges} />
          {!hasChanges ? (
            <p className="text-muted-foreground text-xs">
              Update at least one slot to save changes.
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </form>
  )
}
