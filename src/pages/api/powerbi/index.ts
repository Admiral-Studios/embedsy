import { NextApiRequest, NextApiResponse } from 'next/types'
import { ReportTypes } from 'src/enums/pageTypes'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { reportId, workspaceId, reportType } = request.query
  const { email, datasetId, rowLevelRole } = request.body

  const authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
    .then(res => res.json())
    .then(data => data.access_token)

  const reportToken = await (reportType === ReportTypes.PowerBiReport
    ? fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/powerbi/report-token/report?reportId=${reportId}&workspaceId=${workspaceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ authenticationToken, email, datasetId, rowLevelRole })
        }
      )
    : fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/powerbi/report-token/paginated-report?reportId=${reportId}&workspaceId=${workspaceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ authenticationToken, email })
        }
      )
  )
    .then(res => res.json())
    .then(data => data.token)

  const embedUrl = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/powerbi/embed-url?reportId=${reportId}&workspaceId=${workspaceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ authenticationToken })
    }
  )
    .then(res => res.json())
    .then(data => data.embedUrl)

  response.status(200).json({
    reportToken,
    embedUrl
  })
}
