import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, roleId } = req.body

    if (email && roleId) {
      const query = `INSERT INTO user_roles VALUES ('${email}', '${roleId}')`
      await ExecuteQuery(query)

      res.status(200).json(req.body)
    }
  } else {
    res.status(405).json({ message: 'Failed to insert user role' })
  }
}
