import { NextApiRequest, NextApiResponse } from 'next/types'
import { PageTypesEnum } from 'src/enums/pageTypes'
import ExecuteQuery from 'src/utils/db'
import { transformWorkspaceId } from 'src/utils/workspaceIDTransformer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email } = req.body as { email: string }

    if (email) {
      const getUserRoleQuery = `SELECT
          r.role,
          r.can_refresh,
          r.can_export,
          r.can_manage_own_account,
          r.id AS role_id
      FROM
          user_roles ur
      JOIN
          roles r ON ur.role_id = r.id
      WHERE
          ur.email = '${email}';`
      const userRoleResult = await ExecuteQuery(getUserRoleQuery)

      if (userRoleResult[0].length) {
        const { role, role_id, can_refresh, can_export, can_manage_own_account } = userRoleResult[0][0]

        const getRoleReportsQuery = `SELECT
            workspace_id,
            report_id,
            dataset_id,
            row_level_role,
            preview_pages,
            type,
            iframe_title,
            iframe_html,
            hyperlink_url,
            hyperlink_title,
            hyperlink_new_tab
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
            can_export: Boolean(can_export),
            can_manage_own_account: Boolean(can_manage_own_account),
            workspaces: additionalRoleData,
            iframes: roleReportsResult[0]
              ? roleReportsResult[0]
                  .filter((w: any) => w.type === PageTypesEnum.Iframe)
                  .map((w: any) => ({ iframe_html: w.iframe_html, iframe_title: w.iframe_title, type: w.type }))
              : [],
            hyperlinks: roleReportsResult[0]
              ? roleReportsResult[0]
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
          res.status(200).json({
            role,
            role_id,
            can_refresh: Boolean(can_refresh),
            can_export: Boolean(can_export),
            can_manage_own_account: Boolean(can_manage_own_account),
            workspaces: [],
            iframes: [],
            hyperlinks: []
          })
        }
      } else {
        res.status(200).json({
          role: 'guest',
          role_id: null,
          can_refresh: false,
          can_export: false,
          workspaces: null,
          iframes: null,
          hyperlinks: null
        })
      }
    }
  } catch (error) {
    res.status(403).json({ message: 'Failed to get role by user id' })
  }
}
