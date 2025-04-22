import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { workspaceId } = req.body as { workspaceId: string }

    if (workspaceId) {
      const findRoleQuery = `SELECT * FROM role_reports WHERE workspace_id = '${workspaceId}'`

      const dbResult = await ExecuteQuery(findRoleQuery)
      const [innerArray] = dbResult

      res.status(200).json(innerArray)
    }
  } catch (error) {
    res.status(403).json({ message: 'Failed to get role by user id' })
  }
}
