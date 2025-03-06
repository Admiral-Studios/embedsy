import * as pbi from 'powerbi-client'

export type INavItem = {
  workspaceId: string
  reports: Array<{
    name?: string
    reportId?: string
    children: pbi.Page[]
    previewPages?: boolean
  }>
}
