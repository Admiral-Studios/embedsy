import sql, { ConnectionPool, Request, VarChar } from 'mssql'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { dbConfig } from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const { id, roleId, hyperlink_title, hyperlink_url, hyperlink_new_tab, type } = req.body

    if (hyperlink_title && hyperlink_url) {
      const pool: ConnectionPool = await sql.connect(dbConfig)
      const request: Request = pool.request()

      request.input('id', id)
      const getExistingQuery = `
        SELECT hyperlink_title FROM role_reports 
        WHERE id = @id
      `
      const existingResult = await request.query(getExistingQuery)
      const existingHyperlink = existingResult.recordset[0]

      if (existingHyperlink?.hyperlink_title !== hyperlink_title) {
        request.input('hyperlinkTitle', VarChar, hyperlink_title)
        request.input('id', id)
        const checkExistingQuery = `
          SELECT id, hyperlink_url FROM role_reports 
          WHERE hyperlink_title = @hyperlinkTitle AND id != @id
        `
        const duplicateResult = await request.query(checkExistingQuery)

        if (duplicateResult.recordset.length > 0) {
          const differentUrlExists = duplicateResult.recordset.some(record => record.hyperlink_url !== hyperlink_url)
          if (differentUrlExists) {
            return res.status(400).json({ message: 'A hyperlink with this title already exists with a different URL' })
          }
        }
      }

      request.input('hyperlink_url', VarChar, hyperlink_url)
      request.input('hyperlink_title', VarChar, hyperlink_title)
      request.input('hyperlink_new_tab', hyperlink_new_tab ? 1 : 0)
      request.input('roleId', roleId)
      request.input('type', VarChar, type)
      request.input('id', id)

      const updateQuery = `UPDATE role_reports SET role_id = @roleId, workspace_id = '',
      workspace = '', report_id = '', report = '',
      dataset_id = '', is_effective_identity_required = '0',
      row_level_role = '', preview_pages = '', hyperlink_url = @hyperlink_url,
      hyperlink_title = @hyperlink_title, hyperlink_new_tab = @hyperlink_new_tab,
      type = @type WHERE id = @id`

      await request.query(updateQuery)

      try {
        res.status(200).json({
          ...req.body
        })
      } catch (error: any) {
        console.error('Error updating hyperlink:', error)
        res.status(500).json({ message: 'Error updating hyperlink', error: error.message })
      }
    } else {
      res.status(400).json({ message: 'Missing required fields' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
