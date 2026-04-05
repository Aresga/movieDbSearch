import type { AuthResponse, TwoFaSetupResponse } from '@/types'
import { apiClient } from './client'

export const twofaApi = {
  setup: async (): Promise<TwoFaSetupResponse> => {
    const res = await apiClient.get<Record<string, unknown>>('/2fa/setup')
    const payload = res.data

    // normalize possible backend shapes: { qr_code_url, secret } or { qrcode, secret }
    const qr_code_url = String(payload.qr_code_url ?? payload.qrcode ?? payload.qr ?? '')
    const secret = String(payload.secret ?? payload.key ?? '')
    const bc = payload.backup_codes
    const backup_codes = Array.isArray(bc) ? (bc as string[]) : undefined

    return { qr_code_url, secret, backup_codes }
  },
  activate: async (code: string): Promise<unknown> => {
    // backend expects { token: "123456" }
    const res = await apiClient.post('/2fa/activate', { token: code })
    return res.data
  },
  verify: async (code: string): Promise<AuthResponse> => {
    // backend expects { token: "123456", temp_token?: "..." }
    // const payload: any = { token: code }
    // if (tempToken) payload.temp_token = tempToken
    const res = await apiClient.post<AuthResponse>('/2fa/verify', {token: code})
    return res.data
  },
  disable: async (code: string): Promise<{ message: string }> => {
    const res = await apiClient.post('/2fa/disable', { token: code })
    return res.data
  }
}
