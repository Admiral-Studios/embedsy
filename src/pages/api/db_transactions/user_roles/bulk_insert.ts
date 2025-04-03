import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const userRoles = req.body

    if (!Array.isArray(userRoles) || userRoles.length === 0) {
      return res.status(400).json({ message: 'Invalid input format. An array of user roles is expected.' })
    }

    try {
      for (const { email, roleId } of userRoles) {
        const checkExistingRoleQuery = `SELECT TOP 1 * FROM user_roles WHERE email='${email}'`
        const existingRoleResult = await ExecuteQuery(checkExistingRoleQuery)

        if (!existingRoleResult[0]?.length) {
          const assignRoleQuery = `INSERT INTO user_roles (email, role_id) VALUES ('${email}', ${roleId});`
          await ExecuteQuery(assignRoleQuery)
        }
      }

      res.status(200).json({ message: 'User roles inserted successfully' })
    } catch (error) {
      console.error('Error inserting user roles:', error)
      res.status(500).json({ message: 'Failed to insert user roles' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
