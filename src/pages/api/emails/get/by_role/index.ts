import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { withAuth } from 'src/pages/api/middleware/authMiddleware'

interface EmailObject {
  email: string
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { role } = req.query

    if (role) {
      const findUserQuery = `SELECT DISTINCT ur.email FROM roles r
      INNER JOIN user_roles ur
       ON r.id = ur.role_id
      WHERE r.role = @role`

      const dbResult = await ExecuteQuery(findUserQuery, { role })
      const [innerArray] = dbResult
      const emails: string[] = innerArray.map((obj: EmailObject) => obj.email)

      res.status(200).json({ emails })
    } else {
      res.status(400).json({ message: 'Role parameter is required' })
    }
  } catch (error) {
    res.status(403).json({ message: 'Failed to get users by role' })
  }
}

export default withAuth(handler)
