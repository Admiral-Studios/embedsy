import { ReportTypes } from 'src/enums/pageTypes'

export type RoleType = {
  id: number
  role: string
  can_refresh: null | boolean
  can_export: null | boolean
  can_manage_own_account: null | boolean
}

export type UserRoleType = {
  id: number
  role: string
  role_id: number
  email: string
}

export type RoleReportsType = {
  dataset_id: string
  id: number
  iframe_html: null | string
  iframe_title: null | string
  hyperlink_title: string | null
  hyperlink_url: string | null
  hyperlink_new_tab: boolean | null
  is_effective_identity_required: boolean
  last_refresh_date: string | Date | null
  last_refresh_status: string
  preview_pages: boolean
  report: string
  report_id: string
  role: string
  role_id: number
  row_level_role: string
  source_status: null | string
  type: null | string
  workspace: string
  workspace_id: string
}

export type ReportDataToUpdateType = {
  reportName: string | undefined
  shouldUpdateReportName: boolean
  workspaceName: string | undefined
  shouldUpdateWorkspaceName: boolean
  isRemoved: boolean
}

export type RoleReportsWithUpdateDataType = RoleReportsType & {
  dataToUpdate?: ReportDataToUpdateType
}

export type CreationRoleReportType = {
  dataset_id: string
  id: number | null
  iframe_html: null | string
  iframe_title: null | string
  hyperlink_title: string | null
  hyperlink_url: string | null
  hyperlink_new_tab: boolean | null
  is_effective_identity_required: boolean
  last_refresh_date: string | Date | null
  last_refresh_status: string
  preview_pages: boolean
  report: string | null
  report_id: string | null
  role: string
  role_id: number | null
  row_level_role: string
  source_status: null | string
  type: null | string
  workspace: string | null
  workspace_id: string | null
}

export type WorkspaceType = {
  id: string
  name: string
}

export type RoleWithUsersPagesType = RoleType & {
  users: UserRoleType[]
  pages: RoleReportsType[]
}

export type PageType = RoleReportsWithUpdateDataType & {
  users: UserRoleType[]
  roles: (RoleType & {
    parentPageId: number | null
  })[]
}

export type CreationPageType = CreationRoleReportType & {
  roles: (RoleType & {
    parentPageId: number | null
  })[]
}

export type PowerBiReportType = {
  datasetId: string
  id: string
  name: string
}

export type CreateEditPageType = {
  id?: number | null
  iframe_html: null | string
  iframe_title: null | string
  hyperlink_title: string | null
  hyperlink_url: string | null
  hyperlink_new_tab: boolean | null
  preview_pages: boolean
  report: PowerBiReportType | null
  roles: (RoleType & {
    parentPageId: number | null
  })[]
  type: null | string
  workspace: WorkspaceType | null
  row_level_role: string
}

export type ResponseReportType = {
  id: number
  datasetId: string
  isEffectiveIdentityRequired: number
  last_refresh_date: string
  last_refresh_status: string
  previewPages: boolean
  report: string
  reportId: string
  roleId: number
  rowLevelRole: string
  workspace: string
  workspaceId: string
  iframe_html: string
  iframe_title: string
  hyperlink_title: string
  hyperlink_url: string
  hyperlink_new_tab: boolean
  type: string
}

export type UserType = UserRoleType & {
  roles: RoleType[]
  pages: RoleReportsType[]
}

export type ReportType = (typeof ReportTypes)[keyof typeof ReportTypes]
