import sql, { ConnectionPool, Request, VarChar } from 'mssql'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { dbConfig } from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const { id, roleId, iframe_title, iframe_html, type } = req.body

    if (iframe_title && iframe_html) {
      const pool: ConnectionPool = await sql.connect(dbConfig)
      const request: Request = pool.request()

      const getExistingQuery = `
        SELECT iframe_title FROM role_reports 
        WHERE id = ${id}
      `
      const existingResult = await request.query(getExistingQuery)
      const existingIframe = existingResult.recordset[0]

      if (existingIframe?.iframe_title !== iframe_title) {
        const checkExistingQuery = `
          SELECT id FROM role_reports 
          WHERE iframe_title = '${iframe_title}' AND id != ${id}
        `
        const duplicateResult = await request.query(checkExistingQuery)

        if (duplicateResult.recordset.length > 0) {
          return res.status(400).json({ message: 'An iframe with this title already exists' })
        }
      }

      request.input('iframe_html', VarChar, iframe_html)

      const updateQuery = `UPDATE role_reports SET role_id = '${roleId}', workspace_id = '',
      workspace = '', report_id = '', report = '',
      dataset_id = '', is_effective_identity_required = '0',
      row_level_role = '', preview_pages = '', iframe_html = @iframe_html,
      iframe_title = '${iframe_title || ''}', type = '${type}'  WHERE id = ${id}`

      await request.query(updateQuery)

      try {
        res.status(200).json({
          ...req.body
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
