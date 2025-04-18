import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    const { role, id, can_refresh, can_export, can_manage_own_account } = req.body

    if (role && id) {
      const checkRoleQuery = `SELECT COUNT(*) as count FROM roles WHERE role = @role AND id != @id`
      try {
        const roleExists = await ExecuteQuery(checkRoleQuery, { role, id })
        if (roleExists[0][0].count > 0) {
          return res.status(409).json({ message: 'Role already exists' })
        }

        const canRefresh = can_refresh == null ? 0 : can_refresh ? 1 : 0
        const canExport = can_export == null ? 0 : can_export ? 1 : 0
        const canManage = can_manage_own_account == null ? 0 : can_manage_own_account ? 1 : 0
        const query = `UPDATE roles SET role = @role, can_refresh = @canRefresh, can_export = @canExport, can_manage_own_account = @canManage WHERE id = @id`

        await ExecuteQuery(query, {
          role,
          canRefresh,
          canExport,
          canManage,
          id
        })
        res.status(200).json({
          id,
          role,
          can_refresh: Boolean(canRefresh),
          can_export: Boolean(canExport),
          can_manage_own_account: Boolean(canManage)
        })
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

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
