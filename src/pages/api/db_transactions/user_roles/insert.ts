import { NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole, ExtendedNextApiRequest } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { email, roleId } = req.body
      if (email && roleId) {
        const callerRoleQuery = `
          SELECT r.role 
          FROM users u
          JOIN user_roles ur ON u.email = ur.email
          JOIN roles r ON ur.role_id = r.id
          WHERE u.id = @userId
        `
        const callerRoleResult = await ExecuteQuery(callerRoleQuery, { userId: req.userId })
        const callerRole = callerRoleResult[0][0].role

        const userRoleQuery = `
          SELECT r.role 
          FROM user_roles ur
          JOIN roles r ON ur.role_id = r.id
          WHERE ur.email = @email
        `
        const userRoleResult = await ExecuteQuery(userRoleQuery, { email })
        const existingRole = userRoleResult[0]?.[0]?.role

        if (existingRole === PermanentRoles.super_admin) {
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

        if (existingRole === PermanentRoles.admin && callerRole === PermanentRoles.admin) {
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

        try {
          const deleteQuery = `DELETE FROM user_roles WHERE email=@email`
          await ExecuteQuery(deleteQuery, { email })

          const insertQuery = `INSERT INTO user_roles VALUES (@email, @roleId); SELECT SCOPE_IDENTITY() AS id;`
          const [result] = await ExecuteQuery(insertQuery, { email, roleId })

          res.status(200).json({ ...req.body, id: result[0]?.id })
        } catch (error) {
          console.error('Error updating user role:', error)
          res.status(500).json({ message: 'Failed to update user role' })
        }
      } else {
        res.status(400).json({ message: 'Email and roleId are required' })
      }
    } catch (error) {
      console.error('Error processing request:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
