import axios from 'axios'

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message ?? data?.error ?? error.message ?? 'An error occurred'
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}
