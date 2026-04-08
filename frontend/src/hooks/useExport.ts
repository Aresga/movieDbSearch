import { userApi } from '@/api/user'

/**
 * Custom hook for exporting user GDPR data.
 * Automates creating a downloadable JSON blob dynamically in the browser.
 */
export function useExportData() {
  const exportData = async () => {
    const data = await userApi.exportMe()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return { exportData }
}
