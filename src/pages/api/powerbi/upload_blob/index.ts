import { NextApiRequest, NextApiResponse } from 'next/types'
import AzureBlobService from 'src/lib/azureBlobService'

type FileTypes = 'PDF' | 'PPTX' | 'PNG'

const folder = process.env.NEXT_PUBLIC_AZURE_POWER_BI_VISUALS_FOLDER || 'Power BI Visuals Exports'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { workspaceId, reportId, type, visualName, pageName } = req.body as {
    workspaceId: string
    reportId: string
    type: FileTypes
    visualName?: string
    pageName?: string
  }

  if (!workspaceId || !reportId || !type) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/export_to`, {
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

    const fileBuffer = await response.arrayBuffer()

    const containerClient = AzureBlobService.getInstance()

    const fileName = `${visualName}.png`

    const blockBlobClient = containerClient.getBlockBlobClient(`${folder}/${fileName}`)

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: 'image/png' }
    })

    return res.status(200).json({
      url: `https://${process.env.NEXT_PUBLIC_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.NEXT_PUBLIC_STORAGE_CONTAINER_NAME}/${fileName}`
    })
  } catch (error: any) {
    console.log(error)
    if (error.response?.status && error.response?.data?.error?.message) {
      return res.status(error.response.status).json({
        error: error.response.data.error.message
      })
    }

    res.status(500).json({ error: error.response?.data?.error?.message || 'Something went wrong' })
  }
}
