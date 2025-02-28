import { ReportTypes } from 'src/enums/pageTypes'
import { ReportType } from 'src/types/types'

const ReportTypesSubRoutes = {
  paginatedReport: 'paginated-report',
  report: 'report'
}

export const getSubRouteByReportType = (reportType: ReportType | undefined) => {
  switch (reportType) {
    case ReportTypes.PowerBiPaginatedReport: {
      return ReportTypesSubRoutes.paginatedReport
    }
    case ReportTypes.PowerBiReport:
    default: {
      return ReportTypesSubRoutes.report
    }
  }
}

export const getReportTypeFromSubRouteBy = (reportType: string) => {
  switch (reportType) {
    case ReportTypesSubRoutes.paginatedReport: {
      return ReportTypes.PowerBiPaginatedReport
    }
    case ReportTypesSubRoutes.report: {
      return ReportTypes.PowerBiReport
    }
    default: {
      return undefined
    }
  }
}
