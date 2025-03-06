import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'
import { updateDatasetStatus } from 'src/pages/api/utils/refresh/updateDatasetStatus'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { workspaceId, datasetId } = request.body
  let authenticationToken = request.body.authenticationToken

  if (!authenticationToken) {
    authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
      .then(res => res.json())
      .then(data => data.access_token)
  }

  const refreshUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets/${datasetId}/refreshes`

  try {
    const refreshResponse = await axios.post(
      refreshUrl,
      {
        notifyOption: 'NoNotification'
      },
      {
        headers: {
          Authorization: `Bearer ${authenticationToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (refreshResponse.status === 202) {
      const requestId = refreshResponse.headers['requestid']
      if (requestId) {
        const refreshStatus = await checkRefreshStatus(workspaceId, datasetId, requestId, authenticationToken)
        if (refreshStatus) {
          return response.status(202).json({ message: 'Refresh request accepted', ...refreshStatus })
        } else {
          return response.status(202).json({ message: 'Refresh request accepted' })
        }
      } else {
        return response.status(500).json({ error: 'RequestId not found in Dataset Refresh response' })
      }
    } else {
      return response.status(refreshResponse.status).json({ error: 'Unexpected response from Power BI API' })
    }
  } catch (error: any) {
    console.error('Error refreshing dataset:', error.response?.data || error.message)
    
return response.status(error.response?.status || 500).json({ error: 'Failed to refresh dataset' })
  }
}

async function checkRefreshStatus(
  workspaceId: string,
  datasetId: string,
  requestId: string,
  authToken: string
): Promise<{ status: string; last_refresh_date: Date } | undefined> {
  const maxAttempts = 5
  const delayBetweenAttempts = 2000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const historyUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets/${datasetId}/refreshes`
      const response = await axios.get(historyUrl, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      const refreshes = response.data.value
      if (refreshes && refreshes.length > 0) {
        const latestRefresh = refreshes.find((refresh: any) => refresh.requestId === requestId)
        if (latestRefresh) {
          let dbStatus: 'success' | 'failed' | 'unknown'
          if (latestRefresh.status === 'Completed') {
            dbStatus = 'success'
          } else if (latestRefresh.status === 'Failed') {
            dbStatus = 'failed'
          } else if (latestRefresh.status === 'Unknown') {
            dbStatus = 'unknown'
          } else {
            dbStatus = 'unknown'
          }
          await updateDatasetStatus(workspaceId, datasetId, dbStatus, latestRefresh.startTime)
          
return { status: dbStatus, last_refresh_date: latestRefresh.startTime }
        }
      }

      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts))
    } catch (error) {
      console.error('Error checking refresh history:', error)
    }
  }

  return undefined
}
