import axios from 'axios'
import {
  useState,
  createContext,
  ReactNode,
  FC,
  useRef,
  useCallback,
  useEffect,
  MutableRefObject,
  useMemo
} from 'react'
import toast from 'react-hot-toast'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { useAdminRoles } from 'src/hooks/useAdminRoles'
import { useAuth } from 'src/hooks/useAuth'
import { PowerBIDatasetType } from 'src/types/apps/powerbiTypes'
import {
  PageType,
  RoleReportsType,
  RoleReportsWithUpdateDataType,
  RoleType,
  RoleWithUsersPagesType,
  UserRoleType,
  UserType,
  WorkspaceType
} from 'src/types/types'
import { findReport } from 'src/utils/configurationUtils'
import { prepareAddPageResponse } from 'src/views/pages/configuration/utils/prepareAddPageResponse'

interface UserConfigurationContextProps {
  allRolesData: RoleWithUsersPagesType[]
  userRoles: UserRoleType[]
  roleReports: RoleReportsType[]
  pages: PageType[]
  userPages: PageType[]
  workspaces: WorkspaceType[] | any
  reportsByWorkspace: RoleReportsType[] | any
  roles: RoleType[]
  users: UserType[]
  getInitialReportsAndDatasets: (workspaceId: string | null) => Promise<void>
  datasetsByWorkspace: PowerBIDatasetType[] | any
  syncRoles: MutableRefObject<RoleType[]>
  syncUserRoles: MutableRefObject<UserRoleType[]>
  syncRoleReports: MutableRefObject<RoleReportsWithUpdateDataType[]>
  setLocalData: () => void
  setUserRoles: (v: UserRoleType[]) => void
  setRoles: (v: RoleType[]) => void
  setRoleReports: (v: RoleReportsWithUpdateDataType[]) => void
  handleRefreshClick: (lastRefreshStatus: string | null, workspaceId: string, datasetId: string) => Promise<void>
  reportsNeedUpdating: RoleReportsWithUpdateDataType[]
  syncReportsWithTenant: () => Promise<void>
  loadingData: boolean
}

interface UserConfigurationProviderProps {
  children: ReactNode
}

export const UserConfigurationContext = createContext<UserConfigurationContextProps>({
  allRolesData: [],
  userRoles: [],
  roleReports: [],
  pages: [],
  userPages: [],
  workspaces: [],
  reportsByWorkspace: [],
  roles: [],
  users: [],
  getInitialReportsAndDatasets: () => Promise.resolve(),
  datasetsByWorkspace: [],
  syncRoles: { current: [] },
  syncUserRoles: { current: [] },
  syncRoleReports: { current: [] },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLocalData: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUserRoles: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setRoles: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setRoleReports: () => {},
  handleRefreshClick: () => Promise.resolve(),
  reportsNeedUpdating: [],
  syncReportsWithTenant: () => Promise.resolve(),
  loadingData: false
})

export const UserConfigurationSharedDataContextProvider: FC<UserConfigurationProviderProps> = ({ children }) => {
  const { hasAdminPrivileges, canRefresh, user, setUser, isAdmin, isSuperAdmin } = useAuth()
  const { viewAsCustomRole } = useAdminRoles()

  const [roles, setRoles] = useState<RoleType[]>([])
  const [allRolesData, setAllRolesData] = useState<RoleWithUsersPagesType[]>([])
  const [userRoles, setUserRoles] = useState<UserRoleType[]>([])
  const [roleReports, setRoleReports] = useState<RoleReportsWithUpdateDataType[]>([])
  const [pages, setPages] = useState<PageType[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [workspaces, setWorkspaces] = useState<WorkspaceType[] | any>([])
  const [reportsByWorkspace, setReportsByWorkspace] = useState<RoleReportsType[] | any>([])
  const [datasetsByWorkspace, setDatasetsByWorkspace] = useState<PowerBIDatasetType[] | any>([])
  const [reportsNeedUpdating, setReportsNeedUpdating] = useState<RoleReportsWithUpdateDataType[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const syncRoles = useRef(roles)
  const syncUserRoles = useRef(userRoles)
  const syncRoleReports = useRef(roleReports)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const userPages = useMemo(() => {
    if (!pages.length || !user?.role) return []

    const userPages = pages
      .filter(page => {
        if (hasAdminPrivileges) {
          return page.roles?.some(role => role.role === user.role)
        }

        return page.role === user.role
      })
      .sort((a, b) => {
        const nameA = a.report.toLowerCase()
        const nameB = b.report.toLowerCase()

        return nameA.localeCompare(nameB)
      })

    return userPages
  }, [pages, user?.role, hasAdminPrivileges])

  const fetchWorkspaces = useCallback(async () => {
    if (hasAdminPrivileges && workspaces.length === 0) {
      try {
        const response = await axios.get('/api/powerbi/workspaces')
        setWorkspaces(response.data)
      } catch (error) {
        console.error('Error fetching workspaces:', error)
      }
    }
  }, [hasAdminPrivileges, workspaces.length])

  const setLocalData = () => {
    const paramRoles: RoleType[] = syncRoles.current
    const paramUserRoles: UserRoleType[] = syncUserRoles.current
    const paramRoleReports: RoleReportsWithUpdateDataType[] = syncRoleReports.current

    setReportsNeedUpdating(
      paramRoleReports.filter(
        ({ dataToUpdate }) =>
          dataToUpdate?.isRemoved || dataToUpdate?.shouldUpdateReportName || dataToUpdate?.shouldUpdateWorkspaceName
      )
    )

    const newAllRolesData = paramRoles.map(r => ({
      ...r,
      users: paramUserRoles.filter(ur => ur.role_id === r.id),
      pages: paramRoleReports.filter(rr => rr.role_id === r.id)
    }))

    setAllRolesData(newAllRolesData)

    const currentCheckedRole = newAllRolesData.find(({ id }) => id === (viewAsCustomRole?.id || user?.role_id))

    if (user) {
      setUser({
        ...user,
        iframes: currentCheckedRole
          ? currentCheckedRole.pages.filter(({ type }) => type === PageTypesEnum.Iframe)
          : user?.iframes || [],
        hyperlinks: currentCheckedRole
          ? currentCheckedRole.pages.filter(({ type }) => type === PageTypesEnum.Hyperlink)
          : user?.hyperlinks || []
      })
    }

    const reports: PageType[] = []

    paramRoleReports.forEach(roleReport => {
      const { dataToUpdate, ...report } = roleReport

      const prevSameReport = findReport(report, reports)

      if (prevSameReport) {
        const newUserRole = paramRoles.find(role => role.id === report.role_id)

        const shouldBeUpdated =
          dataToUpdate?.isRemoved || dataToUpdate?.shouldUpdateReportName || dataToUpdate?.shouldUpdateWorkspaceName

        if (shouldBeUpdated) {
          prevSameReport.dataToUpdate = dataToUpdate
        }

        if (newUserRole) {
          prevSameReport.roles = [...prevSameReport.roles, { ...newUserRole, parentPageId: report.id }]

          prevSameReport.users = [
            ...prevSameReport.users,
            ...paramUserRoles.filter(({ role_id }) => role_id === newUserRole.id)
          ]
        }
      } else {
        reports.push({
          ...report,
          dataToUpdate,
          type: report.type || PageTypesEnum.PowerBiReport,
          iframe_html: report.iframe_html || '',
          iframe_title: report.iframe_title || '',
          hyperlink_url: report.hyperlink_url || '',
          hyperlink_title: report.hyperlink_title || '',
          hyperlink_new_tab: report.hyperlink_new_tab || false,
          roles: paramRoles.filter(role => role.id === report.role_id).map(r => ({ ...r, parentPageId: report.id })),
          users: paramUserRoles.filter(user => user.role_id === report.role_id)
        })
      }
    })

    setPages(
      reports.sort((a, b) => {
        const dateA = a.last_refresh_date ? new Date(a.last_refresh_date).getTime() : 0
        const dateB = b.last_refresh_date ? new Date(b.last_refresh_date).getTime() : 0

        return dateA - dateB
      })
    )

    const usersWithRolesAndReports: UserType[] = []

    paramUserRoles.forEach(userRole => {
      const prevSameEmail = usersWithRolesAndReports.find(({ email }) => email === userRole.email)

      if (prevSameEmail) {
        const foundedRole = paramRoles.find(({ id }) => id === userRole.role_id)

        if (foundedRole) {
          prevSameEmail.roles = [...prevSameEmail.roles, { ...foundedRole }]
          prevSameEmail.pages = paramRoleReports.filter(({ role_id }) =>
            prevSameEmail.roles.find(prevRole => prevRole.id === role_id)
          )
        }
      } else {
        const currentUserRoles = paramRoles.filter(({ id }) => id === userRole.role_id)

        usersWithRolesAndReports.push({
          ...userRole,
          roles: currentUserRoles,
          pages: paramRoleReports.filter(({ role_id }) =>
            currentUserRoles.find(currentRole => currentRole.id === role_id)
          )
        })
      }
    })

    setUsers(usersWithRolesAndReports)
  }

  const fetchData = useCallback(async () => {
    setLoadingData(true)
    if (hasAdminPrivileges) {
      try {
        const [rolesResponse, userRolesResponse, roleReportsResponse] = await Promise.all([
          axios.get<RoleType[]>('/api/db_transactions/role/get/all'),
          axios.get<UserRoleType[]>('/api/db_transactions/user_roles/get/all'),
          axios.get<RoleReportsWithUpdateDataType[]>(
            `/api/db_transactions/role_reports/get/all${isAdmin || isSuperAdmin ? '?is_admin=true' : ''}`
          )
        ])

        const roles = rolesResponse.data
        const userRoles = userRolesResponse.data
        const roleReports = roleReportsResponse.data

        syncRoles.current = roles
        syncUserRoles.current = userRoles
        syncRoleReports.current = roleReports

        setReportsNeedUpdating(
          roleReports.filter(
            ({ dataToUpdate }) =>
              dataToUpdate?.isRemoved || dataToUpdate?.shouldUpdateReportName || dataToUpdate?.shouldUpdateWorkspaceName
          )
        )

        setUserRoles(userRoles)
        setRoleReports(roleReports)
        setRoles(roles)

        setLocalData()
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    } else if (canRefresh && user?.role) {
      try {
        const roleReportsResponse = await axios.post('/api/db_transactions/role_reports/get/by_role', {
          role: user.role
        })
        setRoleReports(roleReportsResponse.data)
        syncRoleReports.current = roleReportsResponse.data
        setLocalData()
      } catch (error) {
        console.error('Error fetching role reports:', error)
      }
    }
    setLoadingData(false)
  }, [hasAdminPrivileges, canRefresh, user])

  const handleGetReports = async (workspaceId: string | null) => {
    try {
      const response = await axios.post(`/api/powerbi/reports`, { workspaceId: workspaceId })
      setReportsByWorkspace(response.data)
    } catch (error) {
      toast.error(`Error fetching reports: ${error}`)
    }
  }

  const handleGetDatasets = async (workspaceId: string | null) => {
    try {
      const response = await axios.post(`/api/powerbi/datasets`, { workspaceId: workspaceId })
      setDatasetsByWorkspace(response.data)
    } catch (error) {
      console.error('Error fetching datasets:', error)
    }
  }

  const getInitialReportsAndDatasets = async (workspaceId: string | null) => {
    await handleGetReports(workspaceId)
    await handleGetDatasets(workspaceId)
  }

  const handleRefreshClick = async (lastRefreshStatus: string | null, workspaceId: string, datasetId: string) => {
    if (lastRefreshStatus === 'unknown') {
      await handleCancelRefresh(workspaceId, datasetId)
    } else {
      await handleBeginRefresh(workspaceId, datasetId)
    }
  }

  const handleCheckRefreshStatus = async (workspaceId: string, datasetId: string) => {
    try {
      const response = await axios.get('/api/powerbi/refresh/check-status', {
        params: { workspaceId, datasetId }
      })
      if (response.data.status && response.data.last_refresh_date && response.data.status !== 'unknown') {
        setPages(
          pages.map((page: any) =>
            page.dataset_id === datasetId
              ? {
                  ...page,
                  last_refresh_status: response.data.status,
                  last_refresh_date: response.data.last_refresh_date
                }
              : page
          )
        )
      }
    } catch (error) {
      console.error('Error checking refresh status:', error)
    }
  }

  const handleBeginRefresh = async (workspaceId: string, datasetId: string) => {
    setPages(
      pages.map(page =>
        page.dataset_id === datasetId
          ? {
              ...page,
              last_refresh_status: 'unknown'
            }
          : page
      )
    )

    try {
      const response = await axios.post(`/api/powerbi/refresh/begin`, { workspaceId, datasetId })

      if (response.data.status && response.data.last_refresh_date) {
        setPages(
          pages.map(page =>
            page.dataset_id === datasetId
              ? {
                  ...page,
                  last_refresh_status: response.data.status,
                  last_refresh_date: response.data.last_refresh_date
                }
              : page
          )
        )
      }
    } catch (error) {
      console.error('Error refreshing dataset:', error)
    }
  }

  const handleCancelRefresh = async (workspaceId: string, datasetId: string) => {
    try {
      const response = await axios.post(`/api/powerbi/refresh/cancel`, { workspaceId, datasetId })
      if (response.data.status && response.data.last_refresh_date) {
        setPages(
          pages.map(page =>
            page.dataset_id === datasetId
              ? {
                  ...page,
                  last_refresh_status: response.data.status,
                  last_refresh_date: response.data.last_refresh_date
                }
              : page
          )
        )
      }
    } catch (error) {
      console.error('Error canceling refresh:', error)
    }
  }

  const syncReportsWithTenant = async () => {
    const { data } = await axios.post('/api/db_transactions/role_reports/sync', { reports: reportsNeedUpdating })

    const updatedRoleReports = syncRoleReports.current
      .map(report => {
        const foundUpdatedReport = data.find((r: any) => r.id === report.id)

        if (foundUpdatedReport) {
          if (foundUpdatedReport.status === 'deleted') {
            return null
          }

          if (foundUpdatedReport.status === 'updated') {
            return {
              ...prepareAddPageResponse(foundUpdatedReport.data),
              dataToUpdate: {
                reportName: '',
                shouldUpdateReportName: false,
                workspaceName: '',
                shouldUpdateWorkspaceName: false,
                isRemoved: false
              }
            }
          }
        }

        return report
      })
      .filter((report): report is RoleReportsWithUpdateDataType => report !== null)

    syncRoleReports.current = updatedRoleReports

    setLocalData()
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    const checkUnknownRefreshStatus = () => {
      const uniqueWorkspaceDatasetPairs = new Set()
      pages.forEach(page => {
        if (page.last_refresh_status === 'unknown' && page.workspace_id && page.dataset_id) {
          const key = `${page.workspace_id}-${page.dataset_id}`
          if (!uniqueWorkspaceDatasetPairs.has(key)) {
            uniqueWorkspaceDatasetPairs.add(key)
            handleCheckRefreshStatus(page.workspace_id, page.dataset_id)
          }
        }
      })
    }

    checkUnknownRefreshStatus()

    intervalRef.current = setInterval(checkUnknownRefreshStatus, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [pages])

  return (
    <UserConfigurationContext.Provider
      value={{
        allRolesData,
        userRoles,
        roleReports,
        pages,
        userPages,
        workspaces,
        reportsByWorkspace,
        roles,
        users,
        datasetsByWorkspace,
        getInitialReportsAndDatasets,
        syncRoleReports,
        syncRoles,
        syncUserRoles,
        setLocalData,
        setUserRoles: (newUserRoles: UserRoleType[]) => setUserRoles(newUserRoles),
        setRoles: (newRoles: RoleType[]) => setRoles(newRoles),
        setRoleReports: (newRoleReports: RoleReportsWithUpdateDataType[]) => setRoleReports(newRoleReports),
        handleRefreshClick,
        reportsNeedUpdating,
        syncReportsWithTenant,
        loadingData
      }}
    >
      {children}
    </UserConfigurationContext.Provider>
  )
}
