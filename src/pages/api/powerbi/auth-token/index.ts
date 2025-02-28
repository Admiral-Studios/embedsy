import { NextApiRequest, NextApiResponse } from 'next/types'
import { getPortalClientSettingsFromDB } from '../../db_transactions/portal_settings/get'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { client_id, client_secret } = await getPortalClientSettingsFromDB()

  const formData = new FormData()

  formData.append('client_id', client_id)
  formData.append('client_secret', client_secret)
  formData.append('grant_type', 'client_credentials')
  formData.append('resource', 'https://analysis.windows.net/powerbi/api')

  const requestOptions = {
    method: 'POST',
    body: formData
  }

  const fetchResponse = await fetch(
    `https://login.windows.net/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/oauth2/token`,
    requestOptions
  )

  const res = await fetchResponse.json()

  return response.status(200).json(res)
}
