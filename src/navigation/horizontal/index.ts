// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'
import { INavItem } from '../types/types'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import type { AppPortalSettings } from 'src/@core/context/settingsContext'
import { RoleReportsType } from 'src/types/types'
import { getSubRouteByReportType } from 'src/utils/powerbi/powerbiNavigation'

const navigation = (
  navItems: INavItem[],
  iframes: RoleReportsType[],
  hyperlinks: RoleReportsType[],
  portalSettings: AppPortalSettings
): HorizontalNavItemsType => {
  return [
    {
      title: portalSettings.main_menu_name as string,
      icon: 'solar:chart-line-duotone',
      path: '/dashboard',
      children: [
        ...(navItems.length > 0
          ? [
              ...navItems.flatMap(item => {
                const workspaceId = item.workspaceId

                return item.reports.flatMap(report => {
                  const path = `/dashboard/${workspaceId}/${getSubRouteByReportType(report.pageType)}/${
                    report.reportId
                  }`

                  const reportBase = {
                    title: `${report.name}`,
                    path: path,
                    subject: SubjectTypes.ReportIdPage,
                    action: 'read'
                  }

                  if (report.previewPages) {
                    return report.children.map(section => ({
                      title: `${section.displayName}`,
                      path: `${path}?page=${section.name}`,
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
                              path: `${path}?page=${section.name}`,
                              subject: SubjectTypes.ReportIdPage,
                              action: 'read'
                            }))
                          : undefined
                    }
                  }
                })
              })
            ]
          : []),
        ...(iframes?.length > 0
          ? iframes.flatMap(item => {
              return {
                title: item.iframe_title || '',
                path: `/iframes/${item?.iframe_title?.replace(' ', '_').toLowerCase()}`,
                subject: SubjectTypes.ReportIdPage,
                type: item.type,
                action: 'read'
              }
            })
          : []),
        ...(hyperlinks?.length > 0
          ? hyperlinks.flatMap(item => {
              return {
                title: item.hyperlink_title || '',
                path: item.hyperlink_url || '',
                subject: SubjectTypes.ReportIdPage,
                openInNewTab: item.hyperlink_new_tab,
                type: item.type,
                action: 'read'
              }
            })
          : [])
      ]
    }
  ]
}

export default navigation
