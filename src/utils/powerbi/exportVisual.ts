type FileTypes = 'PDF' | 'PPTX' | 'PNG'

export const exportVisual = async (
  workspaceId: string,
  reportId: string,
  type: FileTypes,
  visualName: string,
  pageName: string
) => {
  try {
    const response = await fetch('/api/powerbi/upload_blob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workspaceId,
        reportId,
        type,
        visualName,
        pageName
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Export failed')
    }

    const url = await response.json()

    if (url) {
      return { url: url.url, visualName }
    } else {
      throw new Error('Export failed')
    }
  } catch (error: any) {
    throw error?.message || 'Export failed'
  }
}
