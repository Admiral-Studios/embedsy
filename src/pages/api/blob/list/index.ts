import type { NextApiRequest, NextApiResponse } from 'next/types'
import AzureBlobService from '../../../../lib/azureBlobService'

const handler = async (req: NextApiRequest, res: NextApiResponse<{ urls?: string[]; error?: string }>) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })

    return
  }

  const { folder } = req.query

  if (!folder || typeof folder !== 'string') {
    res.status(400).json({ error: 'Folder parameter is required and should be a string' })

    return
  }

  try {
    const containerClient = AzureBlobService.getInstance()
    const blobPrefix = `${folder}/`
    const urls: string[] = []

    for await (const blob of containerClient.listBlobsFlat({ prefix: blobPrefix })) {
      const url = `https://${process.env.NEXT_PUBLIC_AZURE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.NEXT_PUBLIC_AZURE_CONTAINER_NAME}/${blob.name}`
      urls.push(url)
    }

    res.status(200).json({ urls })
  } catch (error: any) {
    console.error('ERROR:', error)
    res.status(500).json({ error: error?.message || error })
  }
}

export default handler
