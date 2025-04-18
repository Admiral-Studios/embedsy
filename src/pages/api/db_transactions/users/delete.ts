import { NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { withAuth, ExtendedNextApiRequest } from 'src/pages/api/middleware/authMiddleware'
import { PermanentRoles } from 'src/context/types'

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email } = req.body
      if (email) {
        const userRoleQuery = `
          SELECT r.role 
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE ur.email = @email
        `
        const userRoleResult = await ExecuteQuery(userRoleQuery, { email })

        if (userRoleResult[0]?.length) {
          const roleToDelete = userRoleResult[0][0].role

          if (roleToDelete === PermanentRoles.super_admin || roleToDelete === PermanentRoles.admin) {
            const callerRoleQuery = `
              SELECT r.role 
              FROM users u
              JOIN user_roles ur ON u.email = ur.email
              JOIN roles r ON ur.role_id = r.id
              WHERE u.id = @userId
            `
            const callerRoleResult = await ExecuteQuery(callerRoleQuery, { userId: req.userId })
            const callerRole = callerRoleResult[0][0].role

            if (roleToDelete === PermanentRoles.super_admin) {
              if (callerRole !== PermanentRoles.super_admin) {
                return res.status(403).json({ message: 'Only Super Admins can delete other Super Admins.' })
              }

              const superAdminCountQuery = `
                SELECT COUNT(*) as count 
                FROM user_roles ur 
                JOIN roles r ON ur.role_id = r.id 
                WHERE r.role = @role
              `
              const superAdminCount = await ExecuteQuery(superAdminCountQuery, { role: PermanentRoles.super_admin })

              if (superAdminCount[0][0].count <= 1) {
                return res.status(403).json({ message: 'The last Super Admin of the portal cannot be deleted.' })
              }
            }

            if (roleToDelete === PermanentRoles.admin && callerRole === PermanentRoles.admin) {
              const adminCountQuery = `
                SELECT COUNT(*) as count 
                FROM user_roles ur 
                JOIN roles r ON ur.role_id = r.id 
                WHERE r.role = @role
              `
              const adminCount = await ExecuteQuery(adminCountQuery, { role: PermanentRoles.admin })

              if (adminCount[0][0].count <= 1) {
                return res.status(403).json({ message: 'The last Admin of the portal cannot be deleted.' })
              }
            }
          }
        }

        const findUserQuery = `SELECT TOP 1 * FROM users WHERE email=@email`
        const findUser = await ExecuteQuery(findUserQuery, { email })

        if (!findUser[0].length) {
          const findUserRoleQuery = `SELECT TOP 1 * FROM user_roles WHERE email=@email`
          const findUserRole = await ExecuteQuery(findUserRoleQuery, { email })

          if (!findUserRole[0].length) {
            return res.status(404).json({ message: 'User information not found' })
          }
        } else {
          const deleteUserQuery = `DELETE FROM users WHERE email = @email`
          await ExecuteQuery(deleteUserQuery, { email })
        }

        try {
          const deleteUserRolesQuery = `DELETE FROM user_roles WHERE email = @email`
          await ExecuteQuery(deleteUserRolesQuery, { email })
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

export default withAuth(handler)
