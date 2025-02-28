import * as pbi from 'powerbi-client'
import { ReportTypes } from 'src/enums/pageTypes'

export type INavItem = {
  workspaceId: string
  reports: Array<{
    name?: string
    reportId?: string
    children: pbi.Page[]
    previewPages?: boolean
    pageType?: (typeof ReportTypes)[keyof typeof ReportTypes]
  }>
}
