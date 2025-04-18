import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { WorkspaceType } from 'src/types/types'
import ExecuteQuery from 'src/utils/db'
import { PermanentRoles } from 'src/context/types'
import { withRole } from 'src/pages/api/middleware/authMiddleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { is_admin } = req.query

    const query = `SELECT rr.*, r.role FROM role_reports rr
    INNER JOIN roles r
     ON rr.role_id = r.id`

    const dbResult = await ExecuteQuery(query)
    const [innerArray] = dbResult

    let workspaces: WorkspaceType[] = []
    try {
      const workspacesResponse = await axios.get<WorkspaceType[]>(
        `${process.env.NEXT_PUBLIC_URL}/api/powerbi/workspaces`
      )
      if (workspacesResponse.status === 200) {
        workspaces = workspacesResponse.data
      } else {
        workspaces = []
      }
    } catch (error) {
      workspaces = []
    }

    let powerBiReports = []

    if (is_admin) {
      try {
        const authResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
        const authData = await authResponse.json()

        if (authResponse.ok && authData.access_token) {
          const authenticationToken = authData.access_token

          const reportPromises = workspaces.map(async workspace => {
            try {
              const response = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/reports`, {
                workspaceId: workspace.id,
                authenticationToken
              })

              return response.data
            } catch (error) {
              console.error(`Failed to fetch reports for workspace ${workspace.id}:`, error)

              return []
            }
          })

          powerBiReports = (await Promise.all(reportPromises)).flat()
        } else {
          console.warn('PowerBI authentication failed: Invalid or missing access token')
        }
      } catch (error) {
        console.error('PowerBI authentication failed:', error)
      }
    }

    for (let i = 0; i < innerArray.length; i++) {
      let currentReport = innerArray[i]

      const datasetQuery = `SELECT last_refresh_date, last_refresh_status FROM datasets WHERE dataset_id = @datasetId`
      const [datasetResult] = await ExecuteQuery(datasetQuery, { datasetId: currentReport.dataset_id })

      if (datasetResult && datasetResult.length > 0) {
        currentReport = { ...currentReport, ...datasetResult[0] }
      }

      if (is_admin) {
        const relevantPowerBiReport = powerBiReports.find(report => report.id === currentReport.report_id)
        const relevantWorkspace = workspaces.find(workspace => workspace.id === currentReport.workspace_id)

        currentReport = {
          ...currentReport,

          ...(currentReport.type !== PageTypesEnum.Iframe &&
            currentReport.type !== PageTypesEnum.Hyperlink && {
              dataToUpdate: {
                reportName: relevantPowerBiReport?.name,
                shouldUpdateReportName: relevantPowerBiReport?.name !== currentReport.report,
                workspaceName: relevantWorkspace?.name,
                shouldUpdateWorkspaceName: relevantWorkspace?.name !== currentReport.workspace,
                isRemoved: !relevantPowerBiReport || !relevantWorkspace
              }
            })
        }
      }

      innerArray[i] = currentReport
    }

    res.status(200).json(innerArray)
  } catch (error) {
    res.status(403).json({ message: 'Failed to get reports' })
  }
}

export default withRole(handler, [PermanentRoles.admin, PermanentRoles.super_admin])
