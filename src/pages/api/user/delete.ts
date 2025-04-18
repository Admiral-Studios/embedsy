import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { withAuth } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.body

      if (id) {
        const findUserQuery = `DELETE FROM users WHERE id = @id;`

        await ExecuteQuery(findUserQuery, { id })

        res.status(200).json({ id })
      }
    } catch (error) {
      res.status(403).json({ message: 'Failed to delete user' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}

export default withAuth(handler)
