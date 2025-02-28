import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.body
      if (id) {
        const deleteQuery = `DELETE FROM role_reports WHERE id = '${id}'`
        await ExecuteQuery(deleteQuery)

        res.status(200).json({})
      } else {
        res.status(400).json({ message: 'Missing page id' })
      }
    } catch (error) {
      res.status(403).json({ message: 'Failed to delete report' })
    }
  }
}
