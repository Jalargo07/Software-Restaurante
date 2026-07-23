import api from '../services/api'

export function useExcelExport() {
  async function descargarExcel(urlParams: string, nombreArchivo: string) {
    const response = await api.get(`/reportes/exportar/${urlParams}`, { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = nombreArchivo
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 100)
  }

  return { descargarExcel }
}
