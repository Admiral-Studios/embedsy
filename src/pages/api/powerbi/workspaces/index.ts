import { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
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
        
return response.status(500).json({
          error: 'Failed to authenticate with Power BI',
          message:
            'Make sure the Power BI Service Principal is set up in Portal Configuration & has appropriate permissions.'
        })
      }
    }

    const res = await fetch(`https://api.powerbi.com/v1.0/myorg/groups`, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`
      }
    })

    if (!res.ok) {
      if (res.status === 500) {
        throw new Error('Power BI service returned an internal server error')
      }
      throw new Error(`Power BI API returned status: ${res.status}`)
    }

    const data = await res.json()
    const reportData = data.value

    if (!reportData) {
      throw new Error('No workspace data returned from Power BI API')
    }

    return response.status(200).json(reportData)
  } catch (error) {
    console.error('Error fetching Power BI workspaces:', error)
    
return response.status(500).json({
      error: 'Failed to fetch Power BI workspaces',
      message:
        error instanceof Error
          ? error.message
          : 'Make sure the Power BI Service Principal is set up in Portal Configuration & has appropriate permissions.'
    })
  }
}
