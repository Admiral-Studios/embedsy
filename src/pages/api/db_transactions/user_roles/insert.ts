import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, roleId } = req.body

    if (email && roleId) {
      try {
        const deleteQuery = `DELETE FROM user_roles WHERE email='${email}'`
        await ExecuteQuery(deleteQuery)

        const insertQuery = `INSERT INTO user_roles VALUES ('${email}', '${roleId}'); SELECT SCOPE_IDENTITY() AS id;`
        const [result] = await ExecuteQuery(insertQuery)

        res.status(200).json({ ...req.body, id: result[0]?.id })
      } catch (error) {
        console.error('Error updating user role:', error)
        res.status(500).json({ message: 'Failed to update user role' })
      }
    } else {
      res.status(400).json({ message: 'Email and roleId are required' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
