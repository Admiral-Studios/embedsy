import type { NextApiRequest, NextApiResponse } from 'next/types'
import { IncomingForm } from 'formidable'
import AzureBlobService from '../../../../lib/azureBlobService'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse<{ urls?: string[]; error?: string }>) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })

    return
  }

  const form = new IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err)
      res.status(500).json({ error: 'Error parsing form data' })

      return
    }

    try {
      const containerClient = AzureBlobService.getInstance()
      const fileArray = Array.isArray(files.file) ? files.file : [files.file]
      const folder = fields.folder as string | undefined

      if (!fileArray.length) {
        res.status(400).json({ error: 'No files uploaded' })

        return
      }

      const urls = await Promise.all(
        fileArray.map(async (file: any) => {
          const originalFilename = file.originalFilename?.split('.')[0]
          const uniqueTimestamp = new Date().getTime()
          const blobName = `${folder}/${originalFilename}-${uniqueTimestamp}`
          const blockBlobClient = containerClient.getBlockBlobClient(blobName)

          const buffer = await fs.promises.readFile(file.filepath)
          await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype as string | undefined }
          })

          return `https://${process.env.NEXT_PUBLIC_AZURE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.NEXT_PUBLIC_AZURE_CONTAINER_NAME}/${blobName}`
        })
      )

      res.status(200).json({ urls })
    } catch (error) {
      console.error('ERROR:', error)
      res.status(500).json({ error: 'Error uploading to Blob Storage' })
    }
  })
}

export default handler
