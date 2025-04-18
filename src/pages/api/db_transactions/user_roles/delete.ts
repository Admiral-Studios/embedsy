import { NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole, ExtendedNextApiRequest } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { id } = req.body
      if (!id) {
        return res.status(400).json({ message: 'Missing required id parameter' })
      }

      const getUserRoleQuery = `
        SELECT ur.id, r.role 
        FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.id = @id
      `
      const userRoleResult = await ExecuteQuery(getUserRoleQuery, { id })

      if (!userRoleResult?.[0]?.length) {
        return res.status(404).json({ message: 'User role not found' })
      }

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

      const getGuestRoleQuery = `SELECT TOP 1 id FROM roles WHERE role = @guestRole`
      const guestRoleResult = await ExecuteQuery(getGuestRoleQuery, { guestRole: PermanentRoles.guest })

      if (!guestRoleResult?.length) {
        return res.status(404).json({ message: 'Guest role not found' })
      }

      const guestRoleId = guestRoleResult[0][0].id

      const updateQuery = `UPDATE user_roles SET role_id = @guestRoleId WHERE id = @id`
      await ExecuteQuery(updateQuery, { guestRoleId, id })

      res.status(200).json({})
    } catch (error) {
      console.error('Error updating user role:', error)
      res.status(403).json({ message: 'Failed to update user role' })
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
