import { NextApiRequest, NextApiResponse } from 'next/types'
import axios from 'axios'
import { preparePageRequestBody } from 'src/utils/configurationUtils'
import { PageTypesEnum } from 'src/enums/pageTypes'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { reports } = req.body

  if (!Array.isArray(reports) || reports.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty reports array' })
  }

  try {
    const authenticationToken = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/auth-token`)
      .then(res => res.json())
      .then(data => data.access_token)

    const localStateUpdates = []

    for (const report of reports) {
      const { dataToUpdate } = report
      const { reportName, shouldUpdateReportName, workspaceName, shouldUpdateWorkspaceName, isRemoved } = dataToUpdate!

      if (isRemoved) {
        await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role_reports/delete`, { id: report.id })

        localStateUpdates.push({ id: report.id, status: 'deleted' })

        continue
      }

      if (shouldUpdateReportName || shouldUpdateWorkspaceName) {
        const powerBiData = await axios
          .get(`https://api.powerbi.com/v1.0/myorg/groups/${report.workspace_id}/reports/${report.report_id}`, {
            headers: {
              Authorization: `Bearer ${authenticationToken}`
            }
          })
          .then(res => res.data)

        let updatedWorkspaceName = ''

        if (shouldUpdateWorkspaceName) {
          const powerBiWorkspaceData = await axios
            .get(`https://api.powerbi.com/v1.0/myorg/groups/${powerBiData.datasetWorkspaceId}`, {
              headers: {
                Authorization: `Bearer ${authenticationToken}`
              }
            })
            .then(res => res.data)

          updatedWorkspaceName = powerBiWorkspaceData.name
        }

        const { data } = await axios.patch(
          `${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role_reports/update_with_powerbi`,
          preparePageRequestBody(
            { ...report, report: powerBiData.name || reportName, workspace: updatedWorkspaceName || workspaceName },
            (report.type || PageTypesEnum.PowerBiReport) as PageTypesEnum
          )
        )

        localStateUpdates.push({ id: report.id, data: { ...data }, status: 'updated' })
      }
    }

    res.status(200).json(localStateUpdates)
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ error: 'Failed to sync reports' })
  }
}
