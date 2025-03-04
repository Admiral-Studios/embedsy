import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { transformWorkspaceId } from 'src/utils/workspaceIDTransformer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email } = req.body as { email: string }

    if (email) {
      const getUserRoleQuery = `SELECT
          r.role,
          r.can_refresh,
          r.id AS role_id
      FROM
          user_roles ur
      JOIN
          roles r ON ur.role_id = r.id
      WHERE
          ur.email = '${email}';`
      const userRoleResult = await ExecuteQuery(getUserRoleQuery)

      if (userRoleResult[0].length) {
        const { role, role_id, can_refresh } = userRoleResult[0][0]

        const getRoleReportsQuery = `SELECT
            workspace_id,
            report_id,
            dataset_id,
            row_level_role,
            preview_pages
        FROM
            role_reports
        WHERE
            role_id = '${role_id}';`
        const roleReportsResult = await ExecuteQuery(getRoleReportsQuery)

        if (roleReportsResult[0].length) {
          const additionalRoleData = transformWorkspaceId(roleReportsResult[0])

          res.status(200).json({
            role,
            role_id,
            can_refresh: Boolean(can_refresh),
            workspaces: additionalRoleData
          })
        } else {
          res.status(200).json({
            role,
            role_id,
            can_refresh: Boolean(can_refresh),
            workspaces: []
          })
        }
      } else {
        res.status(200).json({ role: 'guest', role_id: null, can_refresh: false, workspaces: null })
      }
    }
  } catch (error) {
    res.status(403).json({ message: 'Failed to get role by user id' })
  }
}
