import sql, { ConnectionPool, Request } from 'mssql'
import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery, { dbConfig } from 'src/utils/db'
import axios from 'axios'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      previewPages,
      type
    } = req.body

    const previewReportPages = previewPages == null ? 0 : previewPages ? 1 : 0

    if (workspaceId && reportId && (datasetId || type === PageTypesEnum.PowerBiPaginated)) {
      const pool: ConnectionPool = await sql.connect(dbConfig)
      const request: Request = pool.request()

      request.input('roleId', roleId)
      request.input('workspaceId', workspaceId || '')
      request.input('workspace', workspace || '')
      request.input('reportId', reportId || '')
      request.input('report', report || '')
      request.input('datasetId', datasetId || '')
      request.input('isEffectiveIdentityRequired', isEffectiveIdentityRequired || 0)
      request.input('rowLevelRole', rowLevelRole || '')
      request.input('previewReportPages', previewReportPages)
      request.input('type', type)
      request.input('id', id)

      const query = `UPDATE role_reports SET role_id = @roleId, workspace_id = @workspaceId,
      workspace = @workspace, report_id = @reportId, report = @report,
      dataset_id = @datasetId, is_effective_identity_required = @isEffectiveIdentityRequired,
      row_level_role = @rowLevelRole, preview_pages = @previewReportPages, type = @type WHERE id = @id`

      await request.query(query)

      if (type === PageTypesEnum.PowerBiPaginated && !datasetId) {
        res.status(200).json(req.body)

        return
      }

      const checkDatasetQuery = `
        SELECT last_refresh_status, last_refresh_date
        FROM datasets
        WHERE dataset_id = @datasetId
      `

      try {
        const [result] = await ExecuteQuery(checkDatasetQuery, { datasetId })
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

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
