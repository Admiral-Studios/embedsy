import { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const { workspaceId } = request.body

    if (!workspaceId) {
      return response.status(400).json({ error: 'Workspace ID is required' })
    }

    let authenticationToken = request.body.authenticationToken

    if (!authenticationToken) {
      try {
        const authResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)

        if (!authResponse.ok) {
          throw new Error(`Authentication failed with status: ${authResponse.status}`)
        }

        const authData = await authResponse.json()
        authenticationToken = authData.access_token

        if (!authenticationToken) {
          throw new Error('Failed to retrieve authentication token')
        }
      } catch (authError) {
        console.error('Authentication error:', authError)
        
return response.status(500).json({ error: 'Failed to authenticate with Power BI' })
      }
    }

    const reportsResponse = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`
      }
    })

    if (!reportsResponse.ok) {
      throw new Error(`Power BI API returned status: ${reportsResponse.status}`)
    }

    const reportsData = await reportsResponse.json()
    const reportData = reportsData.value

    if (!reportData) {
      throw new Error('No report data returned from Power BI API')
    }

    return response.status(200).json(reportData)
  } catch (error) {
    console.error('Error fetching Power BI reports:', error)
    
return response.status(500).json({
      error: 'Failed to fetch Power BI reports',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
