import { NextResponse } from 'next/server'
import type { ApiErrorCode } from '@/lib/api-contracts'

type ApiMeta = {
  nextCursor?: string | null
}

type ApiJsonOptions = {
  status?: number
  headers?: HeadersInit
  meta?: ApiMeta
}

export function apiOk<T>(data: T, options: ApiJsonOptions = {}) {
  const body = options.meta ? { data, meta: options.meta } : { data }
  return NextResponse.json(body, {
    status: options.status ?? 200,
    headers: options.headers,
  })
}

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  details: Record<string, unknown> = {},
  headers?: HeadersInit
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
    },
    {
      status,
      headers,
    }
  )
}
