import { NextApiRequest, NextApiResponse } from 'next/types'
import { getPortalClientSettingsFromDB } from '../../db_transactions/portal_settings/get'

export default async function handler(_: NextApiRequest, response: NextApiResponse) {
  try {
    const { client_id, client_secret } = await getPortalClientSettingsFromDB()

    const formData = new URLSearchParams()
    formData.append('grant_type', 'client_credentials')
    formData.append('client_id', client_id)
    formData.append('client_secret', client_secret)
    formData.append('scope', 'https://graph.microsoft.com/.default')

    const fetchResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      }
    )

    const data = await fetchResponse.json()
    
return response.status(200).json(data)
  } catch (error) {
    console.error('Token error:', error)
    
return response.status(500).json({ error: 'Failed to get token' })
  }
}
