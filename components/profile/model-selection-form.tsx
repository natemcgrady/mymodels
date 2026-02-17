'use client'

import { useMemo, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { updateProfileModels } from '@/app/[username]/actions'
import { Button } from '@/components/ui/button'
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

type ModelSelectionFormProps = {
  username: string
  catalog: CatalogModel[]
  initialSelections: {
    plan: number | null
    build: number | null
    debug: number | null
  }
}

type SlotConfig = {
  id: 'plan' | 'build' | 'debug'
  label: 'Plan' | 'Build' | 'Debug'
}

const SLOT_CONFIG: SlotConfig[] = [
  {
    id: 'plan',
    label: 'Plan',
  },
  {
    id: 'build',
    label: 'Build',
  },
  {
    id: 'debug',
    label: 'Debug',
  },
]

function groupByProvider(catalog: CatalogModel[]) {
  return catalog.reduce<Record<string, CatalogModel[]>>((acc, model) => {
    const bucket = acc[model.provider] ?? []
    bucket.push(model)
    acc[model.provider] = bucket
    return acc
  }, {})
}

function SaveButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save selections'}
    </Button>
  )
}

export function ModelSelectionForm({
  username,
  catalog,
  initialSelections,
}: ModelSelectionFormProps) {
  const catalogByProvider = useMemo(() => groupByProvider(catalog), [catalog])
  const [values, setValues] = useState<Record<'plan' | 'build' | 'debug', string>>({
    plan: initialSelections.plan ? String(initialSelections.plan) : '',
    build: initialSelections.build ? String(initialSelections.build) : '',
    debug: initialSelections.debug ? String(initialSelections.debug) : '',
  })

  return (
    <form action={updateProfileModels} className="space-y-3">
      <input type="hidden" name="username" value={username} />
      <input type="hidden" name="plan" value={values.plan} />
      <input type="hidden" name="build" value={values.build} />
      <input type="hidden" name="debug" value={values.debug} />

      <ul className="space-y-3">
        {SLOT_CONFIG.map((slot) => {
          const value = values[slot.id]

          return (
            <li
              key={slot.id}
              className="border-border/70 bg-background/70 flex flex-col items-stretch gap-2 rounded-lg border px-3 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4"
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

      <div className="pt-1">
        <SaveButton />
      </div>
    </form>
  )
}
