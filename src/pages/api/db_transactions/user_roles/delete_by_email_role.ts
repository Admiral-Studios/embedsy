import { NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { ExtendedNextApiRequest, withRole } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email, role_id } = req.body
      if (email && role_id) {
        const roleCheckQuery = `
          SELECT r.role 
          FROM roles r 
          WHERE r.id = @roleId
        `
        const roleResult = await ExecuteQuery(roleCheckQuery, { roleId: role_id })
        const roleToDelete = roleResult[0][0]?.role

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
            return res.status(403).json({ message: 'Only Super Admins can modify other Super Admins.' })
          }

          const superAdminCountQuery = `
            SELECT COUNT(*) as count 
            FROM user_roles ur 
            JOIN roles r ON ur.role_id = r.id 
            WHERE r.role = @role
          `
          const superAdminCount = await ExecuteQuery(superAdminCountQuery, { role: PermanentRoles.super_admin })

          if (superAdminCount[0][0].count <= 1) {
            return res.status(403).json({ message: 'The last Super Admin of the portal cannot be modified.' })
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
            return res.status(403).json({ message: 'The last Admin of the portal cannot be modified.' })
          }
        }

        const query = `DELETE FROM user_roles WHERE email = @email AND role_id = @roleId`
        await ExecuteQuery(query, { email, roleId: role_id })

        res.status(200).json({})
      }
    } catch (error) {
      res.status(403).json({ message: 'Failed to delete user role' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
