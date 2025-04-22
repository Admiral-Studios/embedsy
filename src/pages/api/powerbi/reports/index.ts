import { NextApiRequest, NextApiResponse } from 'next/types'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const { workspaceId } = request.body
  let authenticationToken = request.body.authenticationToken

  if (!authenticationToken) {
    authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
      .then(res => res.json())
      .then(data => data.access_token)
  }

  const reportData = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`, {
    headers: {
      Authorization: `Bearer ${authenticationToken}`
    }
  })
    .then(res => res.json())
    .then(data => data.value)

  return response.status(200).json(reportData)
}
