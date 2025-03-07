import { RoleReportsType } from 'src/types/types'

export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type AzureLoginParams = {
  email: string
  username: string
  rememberMe?: boolean
}

export type AvailableWorkspaceAndReports = {
  workspaceID: string
  reports: string[]
  datasets: string[]
  rowLevelRoles: string[]
  previewPagesReports: string[]
}

export type IframeType = {
  iframe_html: string
  iframe_title: string
  type: string
}

export type UserDataType = {
  id: number
  role: string
  role_id?: number
  custom_role_id?: number
  can_export?: boolean
  can_refresh?: boolean
  can_manage_own_account: boolean
  workspaces: Array<AvailableWorkspaceAndReports>
  email: string
  fullName: string
  username: string
  password: string
  avatar?: string | null
  name: string
  company: string
  title: string
  password_set: boolean
  iframes: RoleReportsType[]
  hyperlinks: RoleReportsType[]
  active_app: boolean
}

export enum PermanentRoles {
  guest = 'guest',
  admin = 'admin',
  super_admin = 'super_admin'
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  isAdmin: boolean
  isSuperAdmin: boolean
  canRefresh: boolean
  canExport: boolean
  hasAdminPrivileges: boolean
  additionalNavItems: any[]
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  azureLogin: (params: AzureLoginParams, errorCallback?: ErrCallbackType) => void
  refresh: () => void
  changeUser: (userData: ChangedUserData, callback: () => void) => void
  delete: () => void
  changePassword: (body: { password: string; newPassword: string }) => void
  populateNavigation: (params: { reportId: string; workspaceId: string }) => void
  defaultLoginActive: boolean
}

export type Role = {
  id: number
  role: string
}

export type AdminRolesType = {
  canViewRoles: boolean
  viewAsCustomRole: Role | null
  roles: Role[]
  onChangeViewAsRole: (role: Role) => void
}

export interface ChangedUserData {
  email?: string
  username?: string
}
