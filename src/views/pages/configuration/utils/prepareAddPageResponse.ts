import { ResponseReportType } from 'src/types/types'

export const prepareAddPageResponse = (data: ResponseReportType) => ({
  dataset_id: data.datasetId || '',
  id: data.id,
  iframe_html: data.iframe_html || '',
  iframe_title: data.iframe_title || '',
  is_effective_identity_required: !!data.isEffectiveIdentityRequired,
  last_refresh_date: data.last_refresh_date || '',
  last_refresh_status: data.last_refresh_status || '',
  preview_pages: data.previewPages,
  report: data.report || '',
  report_id: data.reportId || '',
  role: '',
  role_id: data.roleId,
  row_level_role: data.rowLevelRole || '',
  source_status: '',
  type: data.type,
  workspace: data.workspace || '',
  workspace_id: data.workspaceId || '',
  hyperlink_title: data.hyperlink_title || null,
  hyperlink_url: data.hyperlink_url || null,
  hyperlink_new_tab: data.hyperlink_new_tab || null
})
