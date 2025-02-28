import { NextApiRequest, NextApiResponse } from 'next/types'
import { reportDatasourceGuidRegex } from 'src/utils/regex'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  let authenticationToken = request.body.authenticationToken
  const { reportId, workspaceId } = request.query

  if (!authenticationToken) {
    authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
      .then(res => res.json())
      .then(data => data.access_token)
  }

  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')
  myHeaders.append('Authorization', `Bearer ${authenticationToken}`)

  const datasourcesResponse = await fetch(
    `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/datasources`,
    {
      method: 'GET',
      headers: myHeaders
    }
  )

  const datasources = await datasourcesResponse.json().then(data => data.value)

  const datasets = datasources
    .map((datasource: any) => {
      const inputStringWithDatasetId = datasource?.connectionDetails?.database

      if (inputStringWithDatasetId) {
        const match = inputStringWithDatasetId.match(reportDatasourceGuidRegex)

        return match[0]
      }

      return undefined
    })
    .filter((v: any) => v)

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({
      datasets: datasets.map((dataset: string) => ({
        id: dataset,
        xmlaPermissions: 'ReadOnly'
      })),
      reports: [
        {
          id: '9c751066-6943-44fd-afe4-cb0607a6a4fd',
          allowEdit: false
        }
      ]
    })
  }

  const fetchResponse = await fetch(`https://api.powerbi.com/v1.0/myorg/GenerateToken`, requestOptions)

  const res = await fetchResponse.json().then(data => data)

  return response.status(200).json(res)
}
