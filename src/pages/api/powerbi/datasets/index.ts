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

    const datasetsResponse = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets`, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`
      }
    })

    if (!datasetsResponse.ok) {
      throw new Error(`Power BI API returned status: ${datasetsResponse.status}`)
    }

    const datasetsData = await datasetsResponse.json()
    const datasetData = datasetsData.value

    if (!datasetData) {
      throw new Error('No dataset data returned from Power BI API')
    }

    return response.status(200).json(datasetData)
  } catch (error) {
    console.error('Error fetching Power BI datasets:', error)
    
return response.status(500).json({
      error: 'Failed to fetch Power BI datasets',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
