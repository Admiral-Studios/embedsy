import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email, role_id } = req.body
      if (email) {
        const query = `DELETE FROM user_roles WHERE email = '${email}' AND role_id = '${role_id}'`
        await ExecuteQuery(query)

        res.status(200).json({})
      }
    } catch (error) {
      res.status(403).json({ message: 'Failed to delete user role' })
    }
  }
}
