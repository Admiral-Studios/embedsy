import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.body
      if (id) {
        const getReportQuery = `SELECT * FROM role_reports WHERE id = @id`
        const pageQuery = await ExecuteQuery(getReportQuery, { id })
        const page = pageQuery[0][0]

        if (!page) {
          return res.status(404).json({ message: 'Page not found' })
        }

        let deleteQuery
        if (page.type === 'Iframe') {
          deleteQuery = `DELETE FROM role_reports WHERE iframe_title = @iframeTitle`
          await ExecuteQuery(deleteQuery, { iframeTitle: page.iframe_title })
        } else if (page.type === 'Hyperlink') {
          deleteQuery = `DELETE FROM role_reports WHERE hyperlink_title = @hyperlinkTitle`
          await ExecuteQuery(deleteQuery, { hyperlinkTitle: page.hyperlink_title })
        } else {
          deleteQuery = `DELETE FROM role_reports WHERE report_id = @reportId`
          await ExecuteQuery(deleteQuery, { reportId: page.report_id })
        }

        res.status(200).json({
          type: page.type,
          report_id: page?.report_id || null,
          iframe_title: page?.iframe_title || null,
          hyperlink_title: page?.hyperlink_title || null
        })
      }
    } catch (error) {
      res.status(403).json({ message: 'Failed to delete report' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
