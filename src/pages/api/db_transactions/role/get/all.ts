import { NextApiRequest, NextApiResponse } from 'next/types'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'
import ExecuteQuery from 'src/utils/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = `SELECT * FROM roles`
    const dbResult = await ExecuteQuery(query)
    const [innerArray] = dbResult

    res.status(200).json(innerArray)
  } catch (error) {
    res.status(403).json({ message: 'Failed to get roles' })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
