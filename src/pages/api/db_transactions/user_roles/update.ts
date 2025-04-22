import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const { email, roleId, id } = req.body

    if (email && roleId && id) {
      const query = `UPDATE user_roles SET email = '${email}', role_id = '${roleId}' WHERE id = ${id}`
      await ExecuteQuery(query)

      res.status(200).json(req.body)
    }
  } else {
    res.status(405).json({ message: 'Failed to update user role' })
  }
}
