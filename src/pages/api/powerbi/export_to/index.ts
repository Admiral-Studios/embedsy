import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'

type FileTypes = 'PDF' | 'PPTX' | 'PNG'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { workspaceId, reportId, type, email, rowLevelRole, datasetId } = req.body as {
    workspaceId: string
    reportId: string
    type: FileTypes
    datasetId?: string
    email?: string
    rowLevelRole?: string
  }

  if (!workspaceId || !reportId || !type) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  try {
    const authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
      .then(res => res.json())
      .then(data => data.access_token)

    const exportResponse = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/ExportTo`,
      {
        format: type,
        ...(rowLevelRole &&
          datasetId && {
            powerBIReportConfiguration: {
              identities: [
                {
                  username: email,
                  roles: [rowLevelRole],
                  datasets: [datasetId]
                }
              ]
            }
          })
      },
      {
        headers: {
          Authorization: `Bearer ${authenticationToken}`
        }
      }
    )

    const exportStatusUrl = exportResponse.headers['location']

    let status
    let fileBuffer: ArrayBuffer | null = null
    let fileType: string | null = ''

    do {
      const statusResponse = await fetch(exportStatusUrl, {
        headers: {
          Authorization: `Bearer ${authenticationToken}`
        }
      })

      const statusJson = await statusResponse.json()
      status = statusJson.status

      if (status === 'Succeeded') {
        const saveUrl = statusResponse.headers.get('location')
        const saveResponse = await fetch(saveUrl!, {
          headers: {
            Authorization: `Bearer ${authenticationToken}`
          }
        })

        fileType = saveResponse.headers.get('content-type')
        fileBuffer = await saveResponse.arrayBuffer()
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    } while (status === 'Running' || status === 'NotStarted')

    if (fileBuffer) {
      res.setHeader('Content-Type', fileType || `application/${type.toLowerCase()}`)

      res.status(200).send(Buffer.from(fileBuffer))
    } else {
      res.status(500).json({ error: 'Export failed' })
    }
  } catch (error: any) {
    if (error.response?.status && error.response?.data?.error?.message) {
      return res.status(error.response.status).json({
        error: error.response.data.error.message
      })
    }

    res.status(500).json({ error: error.response?.data?.error?.message || 'Something went wrong' })
  }
}
