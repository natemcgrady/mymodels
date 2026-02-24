export const PROFILE_EDITOR_VALUES = [
  'cursor',
  'neovim',
  'opencode',
  'vscode',
  'jetbrains',
  'vim',
  'notepad++',
] as const

export const PROFILE_EDITOR_OPTIONS = [
  { value: 'cursor', label: 'Cursor' },
  { value: 'neovim', label: 'Neovim' },
  { value: 'opencode', label: 'OpenCode' },
  { value: 'vscode', label: 'VS Code' },
  { value: 'jetbrains', label: 'JetBrains' },
  { value: 'vim', label: 'Vim' },
  { value: 'notepad++', label: 'Notepad++' },
] as const satisfies ReadonlyArray<{ value: ProfileEditor; label: string }>

export type ProfileEditor = (typeof PROFILE_EDITOR_VALUES)[number]
