import { createContext, ReactNode, FC, useContext } from 'react'
import { UserConfigurationContext } from './UserConfigurationSharedDataContext'
import toast from 'react-hot-toast'
import { CreateEditPageType, PageType, RoleReportsWithUpdateDataType } from 'src/types/types'

import { RoleReportsService } from 'src/services/configuration/RoleReportsService'
import { preparePagePayload } from 'src/utils/configurationUtils'

interface PagesContextProps {
  addUpdatePage: (page: CreateEditPageType) => Promise<{
    error: string
    data: null
  }>
  removePagesById: (ids: number[]) => Promise<void>
  removeAllPageRolesById: (ids: number[]) => Promise<void>
  pages: PageType[]
}

interface RolesProviderProps {
  children: ReactNode
}

export const PagesContext = createContext<PagesContextProps>({
  addUpdatePage: () => Promise.resolve({ error: '', data: null }),
  removePagesById: () => Promise.resolve(),
  removeAllPageRolesById: () => Promise.resolve(),
  pages: []
})

export const PagesContextProvider: FC<RolesProviderProps> = ({ children }) => {
  const { pages, setLocalData, datasetsByWorkspace, syncRoleReports, setRoleReports } =
    useContext(UserConfigurationContext)

  const addUpdatePage = async (page: CreateEditPageType, disableSetLocalData: boolean | undefined = false) => {
    const newPages = page.roles.map(r => ({
      ...preparePagePayload(page, datasetsByWorkspace),
      id: r.parentPageId,
      role_id: r.id,
      role: r.role
    }))

    if (newPages.some(np => np?.is_effective_identity_required && !np.rowLevelRole)) {
      return {
        error: 'The selected report requires a row level role.',
        data: null
      }
    }

    try {
      let reports: RoleReportsWithUpdateDataType[] = [...syncRoleReports.current]

      const existingPages = pages.find(({ id }) => id === page.id)?.roles || []

      const rolesToRemove = existingPages.filter(r => !newPages.some(np => np.role_id === r.id))
      const pagesToUpdate = newPages.filter(np => np.id)
      const pagesToAdd = newPages.filter(updatedPage => !updatedPage.id)

      if (rolesToRemove.length) {
        const removedIds = rolesToRemove.map(({ parentPageId }) => parentPageId)

        await RoleReportsService.removeReports(removedIds)

        reports = reports.filter(({ id }) => !removedIds.includes(id))
      }

      if (pagesToUpdate.length) {
        const updatedReports = await RoleReportsService.updateReports(pagesToUpdate)

        reports = syncRoleReports.current.map(report => {
          const foundedReport = updatedReports.find(({ id }) => id === report.id)

          return foundedReport || report
        })
      }

      if (pagesToAdd.length) {
        const createdReports = await RoleReportsService.createReports(pagesToAdd)

        reports = [...createdReports, ...reports]
      }

      syncRoleReports.current = reports
      setRoleReports(reports)

      !disableSetLocalData && setLocalData()

      return { error: '', data: null }
    } catch (error: any) {
      console.error(`Error`, error)
      const errorMessage = error?.response?.data?.message || 'Error updating page'

      return { error: errorMessage, data: null }
    }
  }

  const removeAllPageRolesById = async (ids: number[]) => {
    try {
      const responses = await Promise.all(ids.map(id => RoleReportsService.removeAllPageRoles(id)))

      let updatedRoleReports = [...syncRoleReports.current]

      responses.forEach(response => {
        if (response.type === 'Iframe') {
          updatedRoleReports = updatedRoleReports.filter(report => report.iframe_title !== response.iframe_title)
        } else if (response.type === 'Hyperlink') {
          updatedRoleReports = updatedRoleReports.filter(report => report.hyperlink_title !== response.hyperlink_title)
        } else {
          updatedRoleReports = updatedRoleReports.filter(report => report.report_id !== response.report_id)
        }
      })

      syncRoleReports.current = updatedRoleReports
      setRoleReports(updatedRoleReports)
      setLocalData()
    } catch (error) {
      toast.error('Failed to remove page')
      console.error(error)
    }
  }

  const removePagesById = async (ids: number[]) => {
    try {
      await Promise.all(ids.map(id => RoleReportsService.removePageById(id)))

      const updatedRoleReports = syncRoleReports.current.filter(({ id }) => !ids.includes(id))

      syncRoleReports.current = updatedRoleReports

      setRoleReports(updatedRoleReports)

      setLocalData()
    } catch (error) {
      toast.error('Failed to remove page')
      console.error(error)
    }
  }

  return (
    <PagesContext.Provider value={{ addUpdatePage, removePagesById, removeAllPageRolesById, pages }}>
      {children}
    </PagesContext.Provider>
  )
}
