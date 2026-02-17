export type ModelCatalogEntry = {
  provider: string
  name: string
}

export const MODEL_CATALOG: ModelCatalogEntry[] = [
  { provider: 'Anthropic', name: 'Claude 4 Sonnet' },
  { provider: 'Anthropic', name: 'Claude 4 Sonnet 1M' },
  { provider: 'Anthropic', name: 'Claude 4.5 Haiku' },
  { provider: 'Anthropic', name: 'Claude 4.5 Opus' },
  { provider: 'Anthropic', name: 'Claude 4.5 Sonnet' },
  { provider: 'Anthropic', name: 'Claude 4.6 Opus' },
  { provider: 'Anthropic', name: 'Claude 4.6 Opus (Fast mode)' },
  { provider: 'Cursor', name: 'Composer 1' },
  { provider: 'Cursor', name: 'Composer 1.5' },
  { provider: 'Google', name: 'Gemini 2.5 Flash' },
  { provider: 'Google', name: 'Gemini 3 Flash' },
  { provider: 'Google', name: 'Gemini 3 Pro' },
  { provider: 'Google', name: 'Gemini 3 Pro Image Preview' },
  { provider: 'OpenAI', name: 'GPT-5' },
  { provider: 'OpenAI', name: 'GPT-5 Fast' },
  { provider: 'OpenAI', name: 'GPT-5 Mini' },
  { provider: 'OpenAI', name: 'GPT-5-Codex' },
  { provider: 'OpenAI', name: 'GPT-5.1 Codex' },
  { provider: 'OpenAI', name: 'GPT-5.1 Codex Max' },
  { provider: 'OpenAI', name: 'GPT-5.1 Codex Mini' },
  { provider: 'OpenAI', name: 'GPT-5.2' },
  { provider: 'OpenAI', name: 'GPT-5.2 Codex' },
  { provider: 'OpenAI', name: 'GPT-5.3 Codex' },
  { provider: 'xAI', name: 'Grok Code' },
]
