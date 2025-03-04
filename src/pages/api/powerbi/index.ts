import { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { reportId, workspaceId } = request.query
  const { email, datasetId, rowLevelRole } = request.body

  const authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
    .then(res => res.json())
    .then(data => data.access_token)

  const reportToken = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/powerbi/report-token?reportId=${reportId}&workspaceId=${workspaceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ authenticationToken, email, datasetId, rowLevelRole })
    }
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
