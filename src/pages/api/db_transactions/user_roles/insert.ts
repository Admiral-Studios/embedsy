import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, roleId } = req.body

    if (email && roleId) {
      const query = `INSERT INTO user_roles VALUES ('${email}', '${roleId}'); SELECT SCOPE_IDENTITY() AS id;`
      const [result] = await ExecuteQuery(query)

      res.status(200).json({ ...req.body, id: result[0]?.id })
    }
  } else {
    res.status(405).json({ message: 'Failed to insert user role' })
  }
}
