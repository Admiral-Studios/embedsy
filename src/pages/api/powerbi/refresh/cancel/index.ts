import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'
import ExecuteQuery from 'src/utils/db'
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

  const checkStatusQuery = `
    SELECT last_refresh_status, last_refresh_date
    FROM datasets
    WHERE dataset_id = '${datasetId}'
  `

  try {
    const [result] = await ExecuteQuery(checkStatusQuery)
    if (result && result.length > 0) {
      const { last_refresh_status, last_refresh_date } = result[0]
      if (last_refresh_status !== 'unknown') {
        return response.status(200).json({
          message: 'No in-progress refresh found in database',
          status: last_refresh_status,
          last_refresh_date: last_refresh_date
        })
      }
    }
  } catch (error) {
    console.error('Error checking dataset status in database:', error)
  }

  const historyUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets/${datasetId}/refreshes?$top=3`

  try {
    const historyResponse = await axios.get(historyUrl, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (historyResponse.status !== 200) {
      return response.status(historyResponse.status).json({ error: 'Failed to fetch refresh history' })
    }

    const refreshes = historyResponse.data.value
    const inProgressRefresh = refreshes.find(
      (refresh: any) => refresh.status === 'Unknown' || refresh.status === 'InProgress'
    )

    if (!inProgressRefresh) {
      if (refreshes.length > 0) {
        const latestRefresh = refreshes[0]
        const dbStatus = latestRefresh.status === 'Completed' ? 'success' : 'failed'
        await updateDatasetStatus(workspaceId, datasetId, dbStatus, latestRefresh.startTime)

        return response.status(200).json({
          message: 'No in-progress refresh found, database updated with latest refresh',
          status: dbStatus,
          last_refresh_date: latestRefresh.startTime
        })
      }
      
return response.status(200).json({ message: 'No in-progress refresh found and no refresh history available' })
    }

    const refreshId = inProgressRefresh.requestId

    const cancelRefreshUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets/${datasetId}/refreshes/${refreshId}`

    const cancelResponse = await axios.delete(cancelRefreshUrl, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (cancelResponse.status === 200) {
      const completedRefresh = refreshes.find(
        (refresh: any) => refresh.status === 'Completed' || refresh.status === 'Failed'
      )

      if (completedRefresh) {
        const dbStatus = completedRefresh.status === 'Completed' ? 'success' : 'failed'
        await updateDatasetStatus(workspaceId, datasetId, dbStatus, completedRefresh.startTime)

        return response.status(200).json({
          message: 'Refresh cancelled successfully and database updated',
          status: dbStatus,
          last_refresh_date: completedRefresh.startTime
        })
      } else {
        return response
          .status(200)
          .json({ message: 'Refresh cancelled successfully, but no completed refresh found to update database' })
      }
    } else {
      console.error('Unexpected response:', cancelResponse.status, cancelResponse.data)
      
return response.status(cancelResponse.status).json({
        error: 'Unexpected response from Power BI API',
        details: cancelResponse.data
      })
    }
  } catch (error: any) {
    console.error('Error cancelling refresh:', error.response?.data || error.message)
    
return response.status(error.response?.status || 500).json({
      error: 'Failed to cancel refresh',
      details: error.response?.data || error.message
    })
  }
}
