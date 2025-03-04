import { AvailableWorkspaceAndReports } from 'src/context/types'

export const transformWorkspaceId = (
  inputArray: {
    role_id: number
    role: string
    workspace_id: string
    report_id: string
    dataset_id: string
    row_level_role: string
    preview_pages?: boolean
  }[]
): AvailableWorkspaceAndReports[] => {
  const transformedData: { [key: string]: AvailableWorkspaceAndReports } = {}

  inputArray.forEach(item => {
    const { workspace_id, report_id, dataset_id, row_level_role, preview_pages } = item

    if (!transformedData[workspace_id]) {
      transformedData[workspace_id] = {
        workspaceID: workspace_id,
        reports: [],
        datasets: [],
        rowLevelRoles: [],
        previewPagesReports: []
      }
    }

    transformedData[workspace_id].reports.push(report_id)
    transformedData[workspace_id].datasets.push(dataset_id)
    transformedData[workspace_id].rowLevelRoles.push(row_level_role)
    if (report_id && preview_pages) {
      transformedData[workspace_id].previewPagesReports.push(report_id)
    }
  })

  const resultArray: AvailableWorkspaceAndReports[] = Object.values(transformedData)

  return resultArray
}
