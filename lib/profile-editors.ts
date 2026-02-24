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
  { value: 'cursor', label: 'Cursor', logoPath: '/cursor.svg' },
  { value: 'neovim', label: 'Neovim', logoPath: '/editor-neovim.svg' },
  { value: 'opencode', label: 'OpenCode', logoPath: '/editor-opencode.svg' },
  { value: 'vscode', label: 'VS Code', logoPath: '/editor-vscode.svg' },
  { value: 'jetbrains', label: 'JetBrains', logoPath: '/editor-jetbrains.svg' },
  { value: 'vim', label: 'Vim', logoPath: '/editor-vim.svg' },
  { value: 'notepad++', label: 'Notepad++', logoPath: '/editor-notepadpp.svg' },
] as const satisfies ReadonlyArray<{ value: ProfileEditor; label: string; logoPath: string }>

export type ProfileEditor = (typeof PROFILE_EDITOR_VALUES)[number]

export function getProfileEditorOption(editor: string | null | undefined) {
  if (!editor) return null
  return PROFILE_EDITOR_OPTIONS.find((option) => option.value === editor) ?? null
}
