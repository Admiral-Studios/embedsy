import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'
import { updateDatasetStatus } from 'src/pages/api/utils/refresh/updateDatasetStatus'
import ExecuteQuery from 'src/utils/db'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { workspaceId, datasetId } = request.query
  let authenticationToken = request.body.authenticationToken

  if (!authenticationToken) {
    authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
      .then(res => res.json())
      .then(data => data.access_token)
  }

  let dbLastRefreshStatus: 'success' | 'failed' | 'unknown' | undefined

  const checkStatusQuery = `
    SELECT last_refresh_status, last_refresh_date
    FROM datasets
    WHERE dataset_id = '${datasetId}'
  `

  try {
    const [result] = await ExecuteQuery(checkStatusQuery)
    if (result && result.length > 0) {
      const { last_refresh_status, last_refresh_date } = result[0]
      dbLastRefreshStatus = last_refresh_status as 'success' | 'failed' | 'unknown'
      if (last_refresh_status !== 'unknown') {
        return response.status(200).json({
          message: 'Refresh status retrieved from database',
          status: last_refresh_status,
          last_refresh_date: last_refresh_date
        })
      }
    }
  } catch (error) {
    console.error('Error checking dataset status in database:', error)
  }

  const historyUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/datasets/${datasetId}/refreshes?$top=1`

  try {
    const refreshResponse = await axios.get(historyUrl, {
      headers: {
        Authorization: `Bearer ${authenticationToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (refreshResponse.status === 200) {
      const refreshes = refreshResponse.data.value
      if (refreshes && refreshes.length > 0) {
        const latestRefresh = refreshes[0]
        let dbStatus: 'success' | 'failed' | 'unknown'
        if (latestRefresh.status === 'Completed') {
          dbStatus = 'success'
        } else if (latestRefresh.status === 'Failed') {
          dbStatus = 'failed'
        } else {
          dbStatus = 'unknown'
        }

        if (!dbLastRefreshStatus || (dbLastRefreshStatus && dbStatus !== 'unknown')) {
          await updateDatasetStatus(workspaceId as string, datasetId as string, dbStatus, latestRefresh.startTime)
        }

        return response.status(202).json({
          message: 'Latest refresh status retrieved and database updated successfully',
          status: dbStatus,
          last_refresh_date: latestRefresh.startTime
        })
      } else {
        return response.status(200).json({
          message: 'No refresh history found',
          status: null,
          last_refresh_date: undefined
        })
      }
    } else {
      return response.status(refreshResponse.status).json({ error: 'Unexpected response from Power BI API' })
    }
  } catch (error: any) {
    console.error('Error retrieving refresh status:', error.response?.data || error.message)
    
return response.status(error.response?.status || 500).json({ error: 'Failed to retrieve refresh status' })
  }
}
