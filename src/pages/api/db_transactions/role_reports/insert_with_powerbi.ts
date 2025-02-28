import sql, { ConnectionPool, Request } from 'mssql'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { PageTypesEnum } from 'src/enums/pageTypes'
import ExecuteQuery, { dbConfig } from 'src/utils/db'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const {
      roleId,
      workspaceId,
      workspace,
      reportId,
      report,
      datasetId,
      isEffectiveIdentityRequired,
      rowLevelRole,
      previewPages,
      type
    } = req.body

    const previewReportPages = previewPages == null ? 0 : previewPages ? 1 : 0

    if (workspaceId && reportId && (type === PageTypesEnum.PowerBiPaginated || datasetId)) {
      const pool: ConnectionPool = await sql.connect(dbConfig)
      const request: Request = pool.request()

      const checkExistingQuery = `
        SELECT id FROM role_reports 
        WHERE role_id = ${roleId} AND report_id = '${reportId}'
      `
      const existingResult = await request.query(checkExistingQuery)
      if (existingResult.recordset.length > 0) {
        return res.status(400).json({ message: 'One of the roles is already assigned to that report' })
      }

      const insertQuery = `INSERT INTO role_reports (role_id, workspace_id, workspace, report_id, report,
      dataset_id, is_effective_identity_required, row_level_role, preview_pages, type)
      VALUES (${roleId}, '${workspaceId}', '${workspace}', '${reportId}', '${report}',
      '${datasetId}', '${isEffectiveIdentityRequired || 0}', '${
        rowLevelRole || ''
      }', '${previewReportPages}', '${type}'); SELECT SCOPE_IDENTITY() AS id;`

      const insertResult = await request.query(insertQuery)

      if (type === PageTypesEnum.PowerBiPaginated) {
        return res.status(200).json({
          ...req.body,
          id: insertResult.recordset[0].id
        })
      }

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
            last_refresh_date: new Date(last_refresh_date),
            id: insertResult.recordset[0].id
          })
        } else {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/refresh/check-status`, {
            params: { workspaceId, datasetId }
          })
          res.status(200).json({
            ...req.body,
            id: insertResult.recordset[0].id,
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
