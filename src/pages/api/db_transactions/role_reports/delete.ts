import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.body
      if (id) {
        const query = `DELETE FROM role_reports WHERE id = '${id}'`
        await ExecuteQuery(query)

        res.status(200).json({})
      }
    } catch (error) {
      res.status(403).json({ message: 'Failed to delete report' })
    }
  }
}
