import { createContext, ReactNode, FC, useContext } from 'react'
import { UserConfigurationContext } from './UserConfigurationSharedDataContext'
import toast from 'react-hot-toast'
import { CreationPageType, RoleReportsType, RoleType, RoleWithUsersPagesType } from 'src/types/types'
import { RoleService } from 'src/services/configuration/RoleService'
import { UsersContext } from './UsersContext'
import { RoleReportsService } from 'src/services/configuration/RoleReportsService'
import { PagesContext } from './PagesContext'

type ServiceResponse = 'success' | 'error'

interface RolesContextProps {
  addNewRole: (
    id: number | null,
    role: string,
    canRefresh: boolean,
    canExport: boolean,
    canManageOwnAccount: boolean,
    users?: string[],
    pages?: CreationPageType[]
  ) => Promise<ServiceResponse>
  removeRoleReport: (id: number) => Promise<void>
  removeRoles: (ids: number[]) => Promise<void>
  roles: RoleType[]
  allRolesData: RoleWithUsersPagesType[]
  roleReports: RoleReportsType[]
}

interface RolesProviderProps {
  children: ReactNode
}

export const RolesContext = createContext<RolesContextProps>({
  addNewRole: () => Promise.resolve('success'),
  removeRoleReport: () => Promise.resolve(),
  removeRoles: () => Promise.resolve(),
  roles: [],
  allRolesData: [],
  roleReports: []
})

export const RolesContextProvider: FC<RolesProviderProps> = ({ children }) => {
  const {
    syncUserRoles,
    syncRoles,
    roles,
    setLocalData,
    setUserRoles,
    userRoles,
    setRoles,
    allRolesData,
    syncRoleReports,
    setRoleReports,
    roleReports
  } = useContext(UserConfigurationContext)

  const { assignUserToRole, removeUsers } = useContext(UsersContext)

  const { addUpdatePage } = useContext(PagesContext)

  const addNewRole = async (
    id: number | null,
    newRole: string,
    canRefresh: boolean,
    canExport: boolean,
    canManageOwnAccount: boolean,
    users?: string[],
    pages?: CreationPageType[]
  ): Promise<ServiceResponse> => {
    const existingRole = allRolesData.find(role => role.id === id)

    if (!existingRole) {
      const newRoleId = await RoleService.createRole({
        role: newRole,
        can_refresh: canRefresh,
        can_export: canExport,
        can_manage_own_account: canManageOwnAccount
      })

      const updatedRoles = [
        ...roles,
        {
          role: newRole,
          id: newRoleId,
          can_refresh: canRefresh,
          can_export: canExport,
          can_manage_own_account: canManageOwnAccount
        }
      ]

      setRoles(updatedRoles)
      syncRoles.current = updatedRoles

      if (users?.length) {
        await Promise.all(users.map(user => assignUserToRole(newRoleId, user, true)))
      }

      if (pages?.length) {
        await Promise.all(
          pages.map(page => {
            const roleForPage = {
              role: newRole,
              id: newRoleId,
              can_refresh: canRefresh,
              can_export: canExport,
              can_manage_own_account: canManageOwnAccount,
              parentPageId: null
            }

            return addUpdatePage({
              ...page,
              report: { name: page.report || '', id: page.report_id || '', datasetId: page.dataset_id },
              workspace: { id: page.workspace_id || '', name: page.workspace || '' },
              roles: [roleForPage]
            })
          })
        )
      }

      setLocalData()
    } else {
      await RoleService.updateRole({
        role: newRole,
        id,
        can_refresh: canRefresh,
        can_export: canExport,
        can_manage_own_account: canManageOwnAccount
      })

      const updatedRoles = roles.map(role =>
        role.id === id
          ? {
              role: newRole,
              id: id,
              can_refresh: canRefresh,
              can_export: canExport,
              can_manage_own_account: canManageOwnAccount
            }
          : role
      )

      if (users) {
        const addedUsers = users.filter(user => !existingRole.users.find(({ email }) => email === user))

        if (addedUsers?.length) {
          await Promise.all(users.map(user => assignUserToRole(existingRole.id, user)))
        }

        const removedUsers = existingRole.users.filter(({ email }) => !users.find(user => user === email))

        if (removedUsers.length) {
          await removeUsers(removedUsers.map(({ id }) => id))
        }
      }

      if (pages) {
        const addedPages = pages.filter(page => !existingRole.pages.find(({ id }) => id === page?.id))

        if (addedPages.length) {
          await Promise.all(
            addedPages.map(page => {
              const roleForPage = {
                role: newRole,
                id: existingRole.id,
                can_refresh: canRefresh,
                can_export: canExport,
                can_manage_own_account: canManageOwnAccount,
                parentPageId: null
              }

              return addUpdatePage({
                ...page,
                report: { name: page.report || '', id: page.report_id || '', datasetId: page.dataset_id },
                workspace: { id: page.workspace_id || '', name: page.workspace || '' },
                roles: [roleForPage]
              })
            })
          )
        }

        const removedPages = existingRole.pages.filter(({ id }) => !pages.find(page => page.id === id))

        if (removedPages.length) {
          await Promise.all(
            removedPages.map(page => {
              return removeRoleReport(page.id)
            })
          )
        }
      }

      syncRoles.current = updatedRoles

      setLocalData()

      setRoles(updatedRoles)
    }

    return 'success'
  }

  const removeRoleReport = async (id: number) => {
    try {
      await RoleReportsService.removePageById(id)

      const updatedRoleReports = syncRoleReports.current.filter(r => r.id !== id)

      syncRoleReports.current = updatedRoleReports
      setRoleReports(updatedRoleReports)

      setLocalData()
    } catch (error) {
      toast.error('Failed to remove role report')
      console.error(error)
    }
  }

  const removeRoles = async (ids: number[]) => {
    try {
      await RoleService.removeRoles(ids)

      const updatedRoles = roles.filter(({ id }) => !ids.includes(id))
      setRoles(updatedRoles)
      syncRoles.current = updatedRoles

      const updatedUserRoles = userRoles.filter(({ role_id }) => !ids.includes(role_id))
      setUserRoles(updatedUserRoles)
      syncUserRoles.current = updatedUserRoles

      setLocalData()
    } catch (error) {
      toast.error('Failed to remove page')
      console.error(error)
    }
  }

  return (
    <RolesContext.Provider value={{ addNewRole, removeRoleReport, removeRoles, roles, allRolesData, roleReports }}>
      {children}
    </RolesContext.Provider>
  )
}
