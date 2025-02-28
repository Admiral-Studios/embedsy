import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.body
      if (!id) {
        return res.status(400).json({ message: 'Missing required id parameter' })
      }

      const getGuestRoleQuery = `SELECT TOP 1 id FROM roles WHERE role = '${PermanentRoles.guest}'`
      const guestRoleResult = await ExecuteQuery(getGuestRoleQuery)

      if (!guestRoleResult?.length) {
        return res.status(404).json({ message: 'Guest role not found' })
      }

      const guestRoleId = guestRoleResult[0][0].id

      const updateQuery = `UPDATE user_roles SET role_id = ${guestRoleId} WHERE id = ${id}`
      await ExecuteQuery(updateQuery)

      res.status(200).json({})
    } catch (error) {
      console.error('Error updating user role:', error)
      res.status(403).json({ message: 'Failed to update user role' })
    }
  }
}
