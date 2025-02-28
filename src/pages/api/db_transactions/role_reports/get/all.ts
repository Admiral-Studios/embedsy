import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { WorkspaceType } from 'src/types/types'
import ExecuteQuery from 'src/utils/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { is_admin } = req.query

    const query = `SELECT rr.*, r.role FROM role_reports rr
    INNER JOIN roles r
     ON rr.role_id = r.id`

    const dbResult = await ExecuteQuery(query)
    const [innerArray] = dbResult

    const { data: workspaces } = await axios.get<WorkspaceType[]>(
      `${process.env.NEXT_PUBLIC_URL}/api/powerbi/workspaces`
    )

    let powerBiReports = []

    if (is_admin) {
      const authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
        .then(res => res.json())
        .then(data => data.access_token)

      const reportPromises = workspaces.map(async workspace => {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/reports`, {
          workspaceId: workspace.id,
          authenticationToken
        })

        return response.data
      })

      powerBiReports = (await Promise.all(reportPromises)).flat()
    }

    for (let i = 0; i < innerArray.length; i++) {
      let currentReport = innerArray[i]

      const datasetQuery = `SELECT last_refresh_date, last_refresh_status FROM datasets WHERE dataset_id = '${currentReport.dataset_id}'`
      const [datasetResult] = await ExecuteQuery(datasetQuery)

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
