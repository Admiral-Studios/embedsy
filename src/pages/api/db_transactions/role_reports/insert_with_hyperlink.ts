import sql, { ConnectionPool, Request, VarChar } from 'mssql'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { dbConfig } from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { roleId, type, hyperlink_title, hyperlink_url, hyperlink_new_tab } = req.body

    if (hyperlink_title && hyperlink_url) {
      const pool: ConnectionPool = await sql.connect(dbConfig)
      const request: Request = pool.request()

      request.input('hyperlinkTitle', VarChar, hyperlink_title)
      const checkExistingQuery = `
        SELECT id, role_id, hyperlink_url FROM role_reports 
        WHERE hyperlink_title = @hyperlinkTitle
      `
      const existingResult = await request.query(checkExistingQuery)

      if (existingResult.recordset.length > 0) {
        const sameRoleExists = existingResult.recordset.some(record => record.role_id === roleId)
        if (sameRoleExists) {
          return res.status(400).json({ message: 'One of the roles is already assigned to that hyperlink' })
        }

        const differentUrlExists = existingResult.recordset.some(record => record.hyperlink_url !== hyperlink_url)
        if (differentUrlExists) {
          return res.status(400).json({ message: 'A hyperlink with this title already exists with a different URL' })
        }
      }

      request.input('roleId', roleId)
      request.input('type', VarChar, type)
      request.input('hyperlink_url', VarChar, hyperlink_url)
      request.input('hyperlink_title', VarChar, hyperlink_title)
      request.input('hyperlink_new_tab', hyperlink_new_tab ? 1 : 0)

      const insertQuery = `
        INSERT INTO role_reports (
          role_id, workspace_id, workspace, report_id, report,
          dataset_id, is_effective_identity_required, row_level_role, preview_pages, 
          type, hyperlink_title, hyperlink_url, hyperlink_new_tab
        )
        VALUES (
          @roleId, '', '', '', '',
          '', '0', '', '0', @type, @hyperlink_title, @hyperlink_url, @hyperlink_new_tab
        ); 
        SELECT SCOPE_IDENTITY() AS id;
      `

      try {
        const insertResult = await request.query(insertQuery)

        res.status(200).json({
          ...req.body,
          id: insertResult.recordset[0].id
        })
      } catch (error: any) {
        console.error('Error inserting hyperlink:', error)
        res.status(500).json({ message: 'Error inserting hyperlink', error: error.message })
      }
    } else {
      res.status(400).json({ message: 'Missing required fields' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
