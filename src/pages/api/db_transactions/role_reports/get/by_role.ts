import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { role } = req.body as { role: string }

    if (role) {
      const findRoleQuery = `SELECT * FROM role_reports rr
      INNER JOIN roles r
       ON rr.role_id = r.id
      WHERE r.role = '${role}'`

      const dbResult = await ExecuteQuery(findRoleQuery)
      const [innerArray] = dbResult

      res.status(200).json(innerArray)
    }
  } catch (error) {
    res.status(403).json({ message: 'Failed to get role by user id' })
  }
}
