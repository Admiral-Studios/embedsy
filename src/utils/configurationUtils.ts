import { PageTypesEnum } from 'src/enums/pageTypes'
import { PowerBIDatasetType } from 'src/types/apps/powerbiTypes'
import { CreateEditPageType, PageType, RoleReportsType } from 'src/types/types'

export const preparePagePayload = (pageData: CreateEditPageType, datasetsByWorkspace: PowerBIDatasetType | any) => {
  const dataset = datasetsByWorkspace.find((ds: any) => ds.id === pageData?.report?.datasetId)

  const basePayload = {
    ...pageData,
    report: pageData?.report?.name || '',
    workspace: pageData?.workspace?.name || '',
    rowLevelRole: pageData.row_level_role || '',
    workspace_id: pageData?.workspace?.id,
    report_id: pageData?.report?.id || null,
    dataset_id: pageData?.report?.datasetId,
    is_effective_identity_required: dataset?.isEffectiveIdentityRequired ? 1 : 0
  }

  return basePayload
}

export const preparePageRequestBody = (
  page: ReturnType<typeof preparePagePayload> & { id: number | null; role_id: number; role: string },
  pageType: (typeof PageTypesEnum)[keyof typeof PageTypesEnum]
) => {
  switch (pageType) {
    case PageTypesEnum.PowerBiReport:
    case PageTypesEnum.PowerBiPaginated: {
      return {
        id: page.id,
        roleId: page.role_id,
        previewPages: page.preview_pages,
        type: page.type,
        workspaceId: page.workspace_id,
        workspace: page.workspace,
        reportId: page.report_id,
        report: page.report,
        datasetId: page.dataset_id === 'undefined' ? null : page.dataset_id,
        isEffectiveIdentityRequired: page.is_effective_identity_required,
        rowLevelRole: page.row_level_role || ''
      }
    }

    case PageTypesEnum.Iframe: {
      return {
        id: page.id,
        roleId: page.role_id,
        previewPages: page.preview_pages,
        type: page.type,
        iframe_title: page.iframe_title,
        iframe_html: page.iframe_html
      }
    }

    case PageTypesEnum.Hyperlink: {
      return {
        id: page.id,
        roleId: page.role_id,
        type: page.type,
        hyperlink_title: page.hyperlink_title,
        hyperlink_url: page.hyperlink_url,
        hyperlink_new_tab: page.hyperlink_new_tab
      }
    }

    default:
      return {}
  }
}

export const findReport = (report: RoleReportsType, reports: PageType[]) =>
  reports.find(
    ({
      report_id,
      workspace_id,
      preview_pages,
      row_level_role,
      type,
      iframe_html,
      iframe_title,
      hyperlink_url,
      hyperlink_title
    }) =>
      type === PageTypesEnum.Iframe
        ? iframe_html === report.iframe_html && iframe_title === report.iframe_title
        : type === PageTypesEnum.Hyperlink
        ? hyperlink_url === report.hyperlink_url && hyperlink_title === report.hyperlink_title
        : report_id === report.report_id &&
          workspace_id === report.workspace_id &&
          preview_pages === report.preview_pages &&
          row_level_role === report.row_level_role
  )

export const checkIfTypeIsPowerBi = (type: string) =>
  type === PageTypesEnum.PowerBiReport || type === PageTypesEnum.PowerBiPaginated
