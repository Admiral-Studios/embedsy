import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const findUserQuery = `SELECT DISTINCT r.id, r.role, ur.email FROM roles r
      INNER JOIN user_roles ur
       ON r.id = ur.role_id`

    const dbResult = await ExecuteQuery(findUserQuery)
    const [innerArray] = dbResult

    res.status(200).json(innerArray)
  } catch (error) {
    res.status(403).json({ message: 'Failed to get roles and emails' })
  }
}
