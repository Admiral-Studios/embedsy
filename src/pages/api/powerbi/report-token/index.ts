import { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  let authenticationToken = request.body.authenticationToken
  const { reportId, workspaceId } = request.query
  const { email, datasetId, rowLevelRole } = request.body

  if (!authenticationToken) {
    authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
      .then(res => res.json())
      .then(data => data.access_token)
  }

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  myHeaders.append('Authorization', `Bearer ${authenticationToken}`)

  let body = JSON.stringify({
    resource: 'https://analysis.windows.net/powerbi/api'
  })

  if (rowLevelRole) {
    body = JSON.stringify({
      resource: 'https://analysis.windows.net/powerbi/api',
      identities: [
        {
          username: email,
          roles: [rowLevelRole],
          datasets: [datasetId]
        }
      ]
    })
  }

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: body
  }

  const fetchResponse = await fetch(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
    requestOptions
  )

  const res = await fetchResponse.json().then(data => data)

  return response.status(200).json(res)
}
