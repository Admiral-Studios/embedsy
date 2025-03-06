// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'
import { INavItem } from '../types/types'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import type { AppPortalSettings } from 'src/@core/context/settingsContext'

const navigation = (navItems: INavItem[], portalSettings: AppPortalSettings): VerticalNavItemsType => {
  return [
    {
      title: portalSettings.main_menu_name as string,
      icon: 'solar:chart-line-duotone',
      path: '/dashboard',
      children:
        navItems.length > 0
          ? navItems.flatMap(item => {
              const workspaceId = item.workspaceId

              return item.reports.flatMap(report => {
                const reportBase = {
                  title: `${report.name}`,
                  path: `/dashboard/${workspaceId}/report/${report.reportId}`,
                  subject: SubjectTypes.ReportIdPage,
                  action: 'read'
                }

                if (report.previewPages) {
                  return report.children.map(section => ({
                    title: `${section.displayName}`,
                    path: `/dashboard/${workspaceId}/report/${report.reportId}?page=${section.name}`,
                    subject: SubjectTypes.ReportIdPage,
                    action: 'read'
                  }))
                } else {
                  return {
                    ...reportBase,
                    children:
                      report.children.length > 0
                        ? report.children.map(section => ({
                            title: `${section.displayName}`,
                            path: `/dashboard/${workspaceId}/report/${report.reportId}?page=${section.name}`,
                            subject: SubjectTypes.ReportIdPage,
                            action: 'read'
                          }))
                        : undefined
                  }
                }
              })
            })
          : undefined
    }
  ]
}

export default navigation
