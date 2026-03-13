import { userApi } from '@/api/user'

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
