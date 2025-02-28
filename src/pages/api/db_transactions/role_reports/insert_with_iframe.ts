import sql, { ConnectionPool, Request, VarChar } from 'mssql'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { dbConfig } from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { roleId, type, iframe_html, iframe_title, previewPages } = req.body

    const previewReportPages = previewPages == null ? 0 : previewPages ? 1 : 0

    if (iframe_title && iframe_html) {
      const pool: ConnectionPool = await sql.connect(dbConfig)
      const request: Request = pool.request()

      const checkExistingQuery = `
        SELECT id, role_id, iframe_html FROM role_reports 
        WHERE iframe_title = '${iframe_title}'
      `
      const existingResult = await request.query(checkExistingQuery)

      if (existingResult.recordset.length > 0) {
        const sameRoleExists = existingResult.recordset.some(record => record.role_id === roleId)
        if (sameRoleExists) {
          return res.status(400).json({ message: 'One of the roles is already assigned to that iframe' })
        }

        const differentHtmlExists = existingResult.recordset.some(record => record.iframe_html !== iframe_html)
        if (differentHtmlExists) {
          return res
            .status(400)
            .json({ message: 'An iframe with this title already exists with different HTML content' })
        }
      }

      request.input('iframe_html', VarChar, iframe_html || '')

      const insertQuery = `INSERT INTO role_reports (role_id, workspace_id, workspace, report_id, report,
      dataset_id, is_effective_identity_required, row_level_role, preview_pages, type, iframe_html, iframe_title)
      VALUES (${roleId}, '', '', '', '',
      '', '0', '', '${previewReportPages}', '${type}', @iframe_html, '${iframe_title}'); SELECT SCOPE_IDENTITY() AS id;`

      const insertResult = await request.query(insertQuery)

      try {
        res.status(200).json({
          ...req.body,
          id: insertResult.recordset[0].id
        })
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
