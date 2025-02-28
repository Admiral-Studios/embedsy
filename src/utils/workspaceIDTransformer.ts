import { AvailableWorkspaceAndReports } from 'src/context/types'
import { PageTypesEnum } from 'src/enums/pageTypes'

export const transformWorkspaceId = (
  inputArray: {
    role_id: number
    role: string
    workspace_id: string
    report_id: string
    dataset_id: string
    row_level_role: string
    preview_pages?: boolean
    type: string
    iframe_html: string
    iframe_title: string
  }[]
): AvailableWorkspaceAndReports[] => {
  const transformedData: { [key: string]: AvailableWorkspaceAndReports } = {}

  inputArray.forEach(item => {
    const { workspace_id, report_id, dataset_id, row_level_role, preview_pages, type } = item

    if (type !== PageTypesEnum.Iframe && workspace_id !== 'null') {
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
    }
  })

  const resultArray: AvailableWorkspaceAndReports[] = Object.values(transformedData)

  return resultArray
}
