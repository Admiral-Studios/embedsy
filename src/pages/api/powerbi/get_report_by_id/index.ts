import { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const reportId: string = request.query.reportId as string
    const workspaceId: string = request.query.workspaceId as string

    const authenticationTokenResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
    if (!authenticationTokenResponse.ok) {
      throw new Error(`Failed to fetch authentication token: ${authenticationTokenResponse.statusText}`)
    }

    const authenticationTokenData = await authenticationTokenResponse.json()
    const authenticationToken: string = authenticationTokenData.access_token

    const reportDataResponse = await fetch(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}`,
      {
        headers: {
          Authorization: `Bearer ${authenticationToken}`
        }
      }
    )

    if (!reportDataResponse.ok) {
      throw new Error(`Failed to fetch report data: ${reportDataResponse.statusText}`)
    }

    const reportData = await reportDataResponse.json()

    return response.status(200).json(reportData)
  } catch (error: any) {
    console.error(`Error in PowerBI API request: ${error.message}`)

    return response.status(500).json({ error: 'Internal Server Error' })
  }
}
