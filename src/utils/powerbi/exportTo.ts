import axios from 'axios'
import { createDownloadLink } from '../createDownloadLink'

type FileTypes = 'PDF' | 'PPTX' | 'PNG'

export const exportTo = async (
  workspaceId: string,
  reportId: string,
  type: FileTypes,
  email?: string,
  rowLevelRole?: string,
  datasetId?: string
) => {
  try {
    const response = await fetch('/api/powerbi/export_to', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workspaceId,
        reportId,
        type,
        email,
        rowLevelRole,
        datasetId
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Export failed')
    }

    const blob = await response.blob()

    if (blob) {
      const response = await axios(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/get_report_by_id`, {
        params: { reportId, workspaceId }
      })
      const { name } = response.data

      createDownloadLink(blob, `${name || 'report'}.${blob.type === 'application/zip' ? 'zip' : type.toLowerCase()}`)
    } else {
      throw new Error('Export failed')
    }
  } catch (error: any) {
    throw error?.message || 'Export failed'
  }
}
