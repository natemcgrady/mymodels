'use client'

import { useQuery } from '@tanstack/react-query'
import { ModelSelectionForm } from '@/components/model-selection-form'

type ProfileEditorGateProps = {
  username: string
  initialSelections: {
    plan: number | null
    build: number | null
    debug: number | null
  }
}

type CatalogModel = {
  id: number
  provider: string
  name: string
}

type MeResponse = {
  username: string | null
}

export function ProfileEditorGate({ username, initialSelections }: ProfileEditorGateProps) {
  const { data: me } = useQuery({
    queryKey: ['profile', 'me', 'editor', username],
    queryFn: async () => {
      const response = await fetch('/api/profile/me')
      if (!response.ok) return { username: null } satisfies MeResponse
      return (await response.json()) as MeResponse
    },
    staleTime: 1000 * 60 * 5,
  })

  const canEdit = me?.username === username

  const { data: catalog = [] } = useQuery({
    queryKey: ['model-catalog', 'editor'],
    queryFn: async () => {
      const response = await fetch('/api/model-catalog')
      if (!response.ok) return [] as CatalogModel[]
      return (await response.json()) as CatalogModel[]
    },
    enabled: canEdit,
    staleTime: 1000 * 60 * 30,
  })

  if (!canEdit) {
    return null
  }

  return (
    <ModelSelectionForm
      username={username}
      catalog={catalog}
      initialSelections={initialSelections}
    />
  )
}
