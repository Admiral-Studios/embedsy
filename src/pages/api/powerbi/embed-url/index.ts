import { NextApiRequest, NextApiResponse } from 'next/types'
import { getPortalClientSettingsFromDB } from '../../db_transactions/portal_settings/get'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  let authenticationToken = request.body.authenticationToken

  const reportId = request.query.reportId
  const workspaceId = request.query.workspaceId

  if (!authenticationToken) {
    authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
      .then(res => res.json())
      .then(data => data.access_token)
  }

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  myHeaders.append('Authorization', `Bearer ${authenticationToken}`)

  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  }

  const { client_id, client_secret } = await getPortalClientSettingsFromDB()

  const fetchResponse = await fetch(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}?client_id=${client_id}&secret_id=${client_secret}&resource=https://analysis.windows.net/powerbi/api`,
    requestOptions
  )

  const res = await fetchResponse.json()

  return response.status(200).json(res)
}
