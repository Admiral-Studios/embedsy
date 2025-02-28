import type { NextApiRequest, NextApiResponse } from 'next/types'
import AzureBlobService from '../../../../lib/azureBlobService'

const handler = async (req: NextApiRequest, res: NextApiResponse<{ success?: boolean; error?: string }>) => {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' })

    return
  }

  const { folder, fileName } = req.query

  if (!folder || typeof folder !== 'string' || !fileName || typeof fileName !== 'string') {
    res.status(400).json({ error: 'Folder and File name parameters are required and should be strings' })

    return
  }

  try {
    const containerClient = AzureBlobService.getInstance()
    const blobName = `${folder}/${fileName}`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    await blockBlobClient.delete()

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('ERROR:', error)
    res.status(500).json({ error: 'Error deleting blob from Blob Storage' })
  }
}

export default handler
