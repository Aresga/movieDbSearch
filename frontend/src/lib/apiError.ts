import axios from 'axios'

function normalizeMessagePayload(message: unknown): string | null {
  if (message == null) return null
  if (typeof message === 'string') return message
  if (Array.isArray(message)) {
    const parts = message
      .map((m) => (typeof m === 'string' ? m.trim() : String(m)))
      .filter(Boolean)
    if (parts.length === 0) return null
    return parts.join('. ')
  }
  if (typeof message === 'object') {
    const parts: string[] = []
    for (const v of Object.values(message as Record<string, unknown>)) {
      if (typeof v === 'string') parts.push(v.trim())
      else if (Array.isArray(v)) {
        for (const x of v) {
          if (typeof x === 'string') parts.push(x.trim())
        }
      }
    }
    if (parts.length) return parts.join('. ')
  }
  return null
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown; error?: string } | undefined
    const fromMessage = data ? normalizeMessagePayload(data.message) : null
    if (fromMessage) return fromMessage
    if (typeof data?.error === 'string' && data.error.trim()) return data.error.trim()
    return error.message ?? 'An error occurred'
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}
