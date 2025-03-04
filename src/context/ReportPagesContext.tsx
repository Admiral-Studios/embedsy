import React, { useState, createContext, ReactNode, useEffect } from 'react'
import axios from 'axios'
import * as pbi from 'powerbi-client'
import { AvailableWorkspaceAndReports } from './types'
import { useAdminRoles } from 'src/hooks/useAdminRoles'
import { INavItem } from 'src/navigation/types/types'
import { useAuth } from 'src/hooks/useAuth'

type ReportPagesContextProps = {
  pages: pbi.Page[] | undefined
  setPages: React.Dispatch<React.SetStateAction<pbi.Page[]>>
  setReport: React.Dispatch<React.SetStateAction<pbi.Report | undefined>>
  navItems: INavItem[]
  handlePopulateNavItems: (report: pbi.Report, workspaceId: string, reportId: string) => Promise<void>
  setActivePage: (queryPage: string) => void
  initializePagination: (report: pbi.Report, queryPage: string) => void
}

type ReportPageContextProviderProps = {
  children: ReactNode
}

export const ReportPagesContext = createContext<ReportPagesContextProps | undefined>(undefined)

export const ContextPagesProvider: React.FC<ReportPageContextProviderProps> = ({ children }) => {
  const [pages, setPages] = useState<pbi.Page[]>([])
  const [report, setReport] = useState<pbi.Report | undefined>(undefined)
  const [navItems, setNavItems] = useState<INavItem[] | []>([])
  const { user } = useAuth()
  const { canViewRoles, viewAsCustomRole } = useAdminRoles()
  const [isReportLoaded, setisReportLoaded] = useState(false)

  const setActivePage = async (queryPage: string) => {
    try {
      const page = pages.find(({ name }) => name === queryPage)

      if (page) {
        await page.setActive()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const initializePagination = async (report: pbi.Report, queryPage: string) => {
    if (isReportLoaded) {
      setActivePage(queryPage)
    } else {
      report.on('loaded', async () => {
        if (!pages.length) {
          const localPages = await report.getPages()
          setPages(localPages)
        }
        await setActivePage(queryPage)
        setisReportLoaded(!!report.lastLoadRequest)
      })
    }
  }

  const getReportName = async (workspaceId: string, reportId: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/powerbi/get_report_by_id`, {
        params: { reportId, workspaceId }
      })
      const { name } = response.data

      return { name, id: reportId }
    } catch (error) {
      console.error('Error fetching report name:', error)
      throw error
    }
  }

  const getInitialNav = async (arr: AvailableWorkspaceAndReports[]) => {
    let availableReportIds: any = []

    if (canViewRoles && viewAsCustomRole !== null) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role_reports/get/by_custom_role`,
          {
            roleId: viewAsCustomRole.id
          }
        )
        availableReportIds = response.data.reportIds
      } catch (error) {
        console.error('Error fetching reports for role:', error)
      }
    }

    const reportsList: INavItem[] = []
    for (const item of arr) {
      const workspaceId = item.workspaceID
      const names = await Promise.all(
        item.reports.map(async id => {
          const reportNameData = await getReportName(workspaceId, id)
          if (!canViewRoles || viewAsCustomRole === null || availableReportIds.includes(id)) {
            return reportNameData
          }

          return null
        })
      ).then(results => results.filter(Boolean))

      reportsList.push({
        workspaceId,
        reports: names.map(report => ({
          name: report?.name,
          reportId: report?.id,
          children: [],
          previewPages: item.previewPagesReports.includes(report?.id || '')
        }))
      })
    }

    if (user) {
      await Promise.all(
        reportsList.map(async workspaceItem => {
          await Promise.all(
            workspaceItem.reports.map(async reportItem => {
              if (reportItem.previewPages) {
                const pages = await loadReportPages(reportItem.reportId ?? '', workspaceItem.workspaceId)
                const uniqueChildren = new Set(reportItem.children.map(child => child.displayName))
                pages.forEach((section: pbi.Page) => {
                  if (!uniqueChildren.has(section.displayName)) {
                    reportItem.children.push(section)
                    uniqueChildren.add(section.displayName)
                  }
                })
              }
            })
          )
        })
      )
    }

    return reportsList
  }

  const loadReportPages = async (reportId: string, workspaceId: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_URL}/api/powerbi/report_pages?reportId=${reportId}&workspaceId=${workspaceId}`
      )
      
return response.data
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (user) {
      getInitialNav(user.workspaces)
        .then(data => {
          setNavItems(data)
        })
        .catch(error => {
          console.error(`Error fetching initial navigation data: ${error.message}`)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewRoles, viewAsCustomRole])

  const handlePopulateNavItems = async (report: pbi.Report) => {
    try {
      let reportId = ''
      let pages: pbi.Page[] = []

      const handleLoaded = async () => {
        if (!pages.length) {
          reportId = report.getId()
          pages = await report.getPages()
          const visibleReportSections = pages.filter(item => item.visibility !== 1)

          // Update state unconditionally
          setNavItems(prevNavItems => {
            return prevNavItems.map(workspaceItem => ({
              ...workspaceItem,
              reports: workspaceItem.reports.map(reportItem => {
                if (reportItem.reportId === reportId) {
                  const uniqueChildren = new Set(reportItem.children.map(child => child.displayName))
                  visibleReportSections.forEach(section => {
                    if (!uniqueChildren.has(section.displayName)) {
                      reportItem.children.push(section)
                      uniqueChildren.add(section.displayName)
                    }
                  })
                }

                return reportItem
              })
            }))
          })
        }
      }

      report.on('loaded', handleLoaded)
    } catch (error) {
      console.error('Error handling pages:', error)
    }
  }

  useEffect(() => {
    if (report) {
      handlePopulateNavItems(report)
    }
  }, [report])

  return (
    <ReportPagesContext.Provider
      value={{ pages, setPages, navItems, setReport, handlePopulateNavItems, setActivePage, initializePagination }}
    >
      {children}
    </ReportPagesContext.Provider>
  )
}
