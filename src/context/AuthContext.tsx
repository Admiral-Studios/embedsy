// ** React Imports
import { createContext, useEffect, useState, useMemo, ReactNode } from 'react'
import Cookies from 'js-cookie'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import {
  AuthValuesType,
  PermanentRoles,
  LoginParams,
  ErrCallbackType,
  UserDataType,
  ChangedUserData,
  AzureLoginParams
} from './types'
import toast from 'react-hot-toast'
import { PortalSettingNames } from 'src/@core/context/settingsContext'

// ** Defaults
const unprotectedRoutes: string[] = ['/forgot-password']

const defaultProvider: AuthValuesType = {
  user: null,
  isAdmin: false,
  isSuperAdmin: false,
  canRefresh: false,
  canExport: false,
  hasAdminPrivileges: false,
  additionalNavItems: [],
  loading: true,
  defaultLoginActive: false,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  azureLogin: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  refresh: () => Promise.resolve(),
  changeUser: () => Promise.resolve(),
  delete: () => Promise.resolve(),
  changePassword: () => Promise.resolve(),
  populateNavigation: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const { role } = user || {}

  const isAdmin = useMemo(() => role === PermanentRoles.admin, [role])
  const isSuperAdmin = useMemo(() => role === PermanentRoles.super_admin, [role])
  const canRefresh = useMemo(() => user?.can_refresh, [user])
  const canExport = useMemo(() => user?.can_export, [user])
  const hasAdminPrivileges = useMemo(() => isAdmin || isSuperAdmin, [isAdmin, isSuperAdmin])

  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)
  const [navItems, setNavItems] = useState(defaultProvider.additionalNavItems)
  const [defaultLoginActive, setDefaultLoginActive] = useState<boolean>(false)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const fetchDefaultLoginSetting = async () => {
      try {
        const response = await axios.get(
          `/api/db_transactions/portal_settings/get?setting=${PortalSettingNames.default_login_active}`
        )
        const defaultLoginSetting = response.data
        setDefaultLoginActive(defaultLoginSetting?.value_boolean || false)
      } catch (error) {
        console.error('Error fetching default login setting', error)
        setDefaultLoginActive(false)
      }
    }

    fetchDefaultLoginSetting()
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axios
      .post('/api/auth/login', params, { withCredentials: true })
      .then(async response => {
        const returnUrl = router.query.returnUrl
        const appStateResponse = await axios.get('/api/state/application_state')
        const userData = {
          ...response.data.userData,
          username: response.data.userData.user_name,
          active_app: appStateResponse.data.active
        }
        setUser(userData)

        window.localStorage.setItem('userData', JSON.stringify(userData))

        if (!appStateResponse.data.active) {
          router.replace('/inactive-application')

          return
        }

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback({ message: err.response.data.message })
      })
  }

  const handlePopulateNavigation = (
    params: { reportId: string; workspaceId: string },
    errorCallback?: ErrCallbackType
  ) => {
    fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/powerbi/report_pages?reportId=${params.reportId}&workspaceId=${params.workspaceId}`
    )
      .then(res => res.json())
      .then(data => {
        setNavItems([data])
      })
      .catch(err => {
        if (errorCallback) errorCallback({ message: err.response.data.message })
      })
  }

  const handleAzureLogin = (params: AzureLoginParams, errorCallback?: ErrCallbackType) => {
    axios
      .post('/api/auth/azure-login', params, { withCredentials: true })
      .then(async response => {
        const returnUrl = router.query.returnUrl
        const appStateResponse = await axios.get('/api/state/application_state')
        const userData = {
          ...response.data.userData,
          username: response.data.userData.user_name,
          active_app: appStateResponse.data.active
        }
        setUser(userData)

        window.localStorage.setItem('userData', JSON.stringify(userData))

        if (!appStateResponse.data.active) {
          router.replace('/inactive-application')

          return
        }

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL as string)
      })

      .catch(err => {
        if (errorCallback) errorCallback({ message: err.response.data.message })
      })
  }

  const handleLogout = async (redirectUrl = '/login') => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)

    await axios.post('/api/auth/logout', {})
    router.push(redirectUrl)
  }

  const handleRefresh = async () => {
    try {
      await axios.post('/api/refresh', {}, { withCredentials: true })
    } catch (error) {
      handleLogout()
    }
  }

  const changeUser = async (changedUser: ChangedUserData, callback: () => void) => {
    const { data } = await axios.patch(`/api/user/change`, { ...changedUser, id: user?.id })

    setUser(prev => ({ ...prev, ...data }))

    callback()
  }

  const deleteUser = async () => {
    try {
      await axios.post(`/api/user/delete`, { id: user?.id })

      handleLogout('/register')
    } catch (error) {}
  }

  const changePassword = async (body: { password: string; newPassword: string }) => {
    try {
      await axios.patch(`/api/user/password-change`, { ...body, id: user?.id })
      toast.success('Password Changed Successfully')
    } catch (error) {
      toast.error('Failed To Change Password')
    }
  }

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      setLoading(true)
      if (!unprotectedRoutes.includes(router.route)) {
        try {
          const response = await axios.get('/api/auth/me', { withCredentials: true })

          if (response.status === 204) {
            router.replace('/')

            return
          }

          const { userData } = response.data
          if (userData?.role === PermanentRoles.super_admin || userData?.role === PermanentRoles.admin) {
            const viewAsCustomRoleCookie = Cookies.get('viewAsCustomRole')
            if (viewAsCustomRoleCookie) {
              const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_URL}/api/db_transactions/role/get/by_custom_role`,
                { roleId: viewAsCustomRoleCookie }
              )
              const { workspaces: viewAsCustomRoleWorkspaces, iframes, hyperlinks } = data

              userData.workspaces = viewAsCustomRoleWorkspaces
              userData.iframes = iframes
              userData.hyperlinks = hyperlinks
            }
          }
          const appStateResponse = await axios.get('/api/state/application_state')
          setUser({ ...userData, username: userData.user_name, active_app: appStateResponse.data.active })

          if (!appStateResponse.data.active) {
            router.replace('/inactive-application')

            return
          }
        } catch (error: any) {
          handleLogout()
          router.replace('/')
        } finally {
          setLoading(false)
        }
      }

      setLoading(false)
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const values = {
    user,
    isAdmin,
    isSuperAdmin,
    canRefresh: canRefresh || false,
    canExport: canExport || false,
    hasAdminPrivileges,
    additionalNavItems: navItems,
    loading,
    defaultLoginActive,
    setUser,
    setLoading,
    login: handleLogin,
    azureLogin: handleAzureLogin,
    logout: handleLogout,
    refresh: handleRefresh,
    changeUser,
    delete: deleteUser,
    changePassword,
    populateNavigation: handlePopulateNavigation
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
