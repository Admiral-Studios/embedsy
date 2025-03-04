import sql, { ConnectionPool, Request, VarChar } from 'mssql'
import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery, { dbConfig } from 'src/utils/db'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const {
      id,
      roleId,
      workspaceId,
      workspace,
      reportId,
      report,
      datasetId,
      isEffectiveIdentityRequired,
      rowLevelRole,
      previewPages
    } = req.body

    const previewReportPages = previewPages == null ? 0 : previewPages ? 1 : 0

    if (id && roleId && workspaceId && reportId && datasetId) {
      const pool: ConnectionPool = await sql.connect(dbConfig)
      const request: Request = pool.request()

      request.input('report', VarChar, report || '')
      request.input('workspace', VarChar, workspace || '')

      const query = `UPDATE role_reports SET role_id = '${roleId}', workspace_id = '${workspaceId}',
      workspace = @workspace, report_id = '${reportId}', report = @report,
      dataset_id = '${datasetId}', is_effective_identity_required = '${isEffectiveIdentityRequired}',
      row_level_role = '${rowLevelRole}', preview_pages = ${previewReportPages}  WHERE id = ${id}`

      await request.query(query)

      const checkDatasetQuery = `
        SELECT last_refresh_status, last_refresh_date
        FROM datasets
        WHERE dataset_id = '${datasetId}'
      `

      try {
        const [result] = await ExecuteQuery(checkDatasetQuery)
        if (result && result.length > 0) {
          const { last_refresh_status, last_refresh_date } = result[0]
          res.status(200).json({
            ...req.body,
            last_refresh_status,
            last_refresh_date: last_refresh_date
          })
        } else {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/refresh/check-status`, {
            params: { workspaceId, datasetId }
          })
          res.status(200).json({
            ...req.body,
            last_refresh_status: response.data.status,
            last_refresh_date: response.data.last_refresh_date
          })
        }
      } catch (error: any) {
        console.error('Error checking dataset status:', error)
        res.status(500).json({ message: 'Error checking dataset status', error: error.message })
      }
    } else {
      res.status(400).json({ message: 'Missing required fields' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
