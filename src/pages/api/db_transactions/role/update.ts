import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const { role, id, can_refresh } = req.body

    if (role && id) {
      const canRefresh = can_refresh == null ? 0 : can_refresh ? 1 : 0
      const query = `UPDATE roles SET role = '${role}', can_refresh = ${canRefresh} WHERE id = ${id}`

      try {
        await ExecuteQuery(query)
        res.status(200).json({ id, role, can_refresh: Boolean(canRefresh) })
      } catch (error) {
        console.error('Error updating role:', error)
        res.status(500).json({ message: 'Failed to update user role' })
      }
    } else {
      res.status(400).json({ message: 'Invalid input data' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}
