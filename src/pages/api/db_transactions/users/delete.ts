import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email } = req.body
      if (email) {
        const findUserQuery = `SELECT TOP 1 * FROM users WHERE email='${email}'`
        const findUser = await ExecuteQuery(findUserQuery)

        if (!findUser[0].length) {
          const findUserRoleQuery = `SELECT TOP 1 * FROM user_roles WHERE email='${email}'`
          const findUserRole = await ExecuteQuery(findUserRoleQuery)

          if (!findUserRole[0].length) {
            return res.status(404).json({ message: 'User information not found' })
          }
        } else {
          const deleteUserQuery = `DELETE FROM users WHERE email = '${email}'`
          await ExecuteQuery(deleteUserQuery)
        }

        try {
          const deleteUserRolesQuery = `DELETE FROM user_roles WHERE email = '${email}'`
          await ExecuteQuery(deleteUserRolesQuery)
        } catch (error) {
          console.log('No user roles found to delete')
        }

        res.status(200).json({})
      } else {
        res.status(400).json({ message: 'Email is required' })
      }
    } catch (error: any) {
      res.status(error?.status || 500).json({ message: error?.message || 'Failed to delete user' })
    }
  }
}
