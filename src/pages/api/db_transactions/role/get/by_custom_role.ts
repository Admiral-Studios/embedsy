import { NextApiRequest, NextApiResponse } from 'next/types'
import { PageTypesEnum } from 'src/enums/pageTypes'
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
          r.can_export,
          r.can_manage_own_account,
          rr.workspace_id,
          rr.report_id,
          rr.dataset_id,
          rr.row_level_role,
          rr.preview_pages,
          rr.type,
          rr.iframe_title,
          rr.iframe_html,
          rr.hyperlink_title,
          rr.hyperlink_url,
          rr.hyperlink_new_tab
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
          can_export: Boolean(userRoles[0].can_export),
          can_manage_own_account: Boolean(userRoles[0].can_manage_own_account),
          workspaces: additionalRoleData,
          iframes: userRoles
            ? userRoles
                .filter((w: any) => w.type === PageTypesEnum.Iframe)
                .map((w: any) => ({ iframe_html: w.iframe_html, iframe_title: w.iframe_title, type: w.type }))
            : [],
          hyperlinks: userRoles
            ? userRoles
                .filter((w: any) => w.type === PageTypesEnum.Hyperlink)
                .map((w: any) => ({
                  hyperlink_url: w.hyperlink_url,
                  hyperlink_title: w.hyperlink_title,
                  hyperlink_new_tab: w.hyperlink_new_tab,
                  type: w.type
                }))
            : []
        })
      } else {
        // TODO: Refactor role attribution in a more structured way
        // Possibly by changing query above to return role even if workspaces are null
        res.status(200).json({
          role: 'guest',
          workspaces: null,
          iframes: null,
          hyperlinks: null
        })
      }
    } else {
      res.status(400).json({ message: 'Invalid request: Role id is required' })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
