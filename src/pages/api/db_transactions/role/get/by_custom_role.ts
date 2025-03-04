import { NextApiRequest, NextApiResponse } from 'next/types'
import ExecuteQuery from 'src/utils/db'
import { transformWorkspaceId } from 'src/utils/workspaceIDTransformer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { roleId } = req.body as { roleId: string }

    if (roleId) {
      const getRoleQuery = `
        SELECT
          r.role,
          r.can_refresh,
          rr.workspace_id,
          rr.report_id,
          rr.dataset_id,
          rr.row_level_role,
          rr.preview_pages
        FROM
          roles r
        JOIN
          role_reports rr ON r.id = rr.role_id
        WHERE
          r.id = ${roleId};`

      const roleQueryResult = await ExecuteQuery(getRoleQuery)

      if (roleQueryResult[0].length) {
        const userRoles = roleQueryResult[0]
        const additionalRoleData = transformWorkspaceId(userRoles)

        res.status(200).json({
          role: userRoles[0].role,
          role_id: roleId,
          can_refresh: Boolean(userRoles[0].can_refresh),
          workspaces: additionalRoleData
        })
      } else {
        // TODO: Refactor role attribution in a more structured way
        // Possibly by changing query above to return role even if workspaces are null
        res.status(200).json({ role: 'guest', workspaces: null })
      }
    } else {
      res.status(400).json({ message: 'Invalid request: Role id is required' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
