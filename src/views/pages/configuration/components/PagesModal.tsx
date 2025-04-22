import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Menu,
  MenuItem,
  Typography
} from '@mui/material'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import CustomDialog from 'src/components/shared/CustomDialog'
import CustomTextField from 'src/@core/components/mui/text-field'
import { CreationPageType, PowerBiReportType, RoleReportsType, RoleType, WorkspaceType } from 'src/types/types'
import toast from 'react-hot-toast'
import HtmlEditor from './HtmlEditor'
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog'
import uppercaseFirstLetter from 'src/utils/uppercaseFirstLetter'
import moment from 'moment'
import ChipItem from 'src/components/shared/ChipItem'
import { PageTypesEnum, ReportTypes } from 'src/enums/pageTypes'
import AutocompleteInput from 'src/components/shared/AutocompleteInput'
import { RolesContext } from 'src/context/UserConfiguration/RolesContext'
import { UserConfigurationContext } from 'src/context/UserConfiguration/UserConfigurationSharedDataContext'
import { PagesContext } from 'src/context/UserConfiguration/PagesContext'
import { urlRegex } from 'src/utils/regex'

type Props = {
  pageReportToUpdate: CreationPageType | null
  open: boolean
  onClose: () => void
  status?: string
  refreshDate?: string
  roleAddingDisabled?: boolean
  handleProcessed: (
    pageType: string,
    workspace: WorkspaceType | null,
    report: PowerBiReportType | null,
    iframeHtml: string | null,
    iframeTitle: string | null,
    hyperlinkUrl: string | null,
    hyperlinkTitle: string | null,
    hyperlinkNewTab: boolean | null,
    roles: RoleType[],
    rowLevelRole: string,
    previewPage: boolean
  ) => Promise<string | null>
}

const PagesModal = ({ open, onClose, pageReportToUpdate, roleAddingDisabled = false, handleProcessed }: Props) => {
  const isAdd = !pageReportToUpdate?.id

  const { roleReports, roles: allRoles } = useContext(RolesContext)

  const { workspaces, getInitialReportsAndDatasets, reportsByWorkspace } = useContext(UserConfigurationContext)
  const { removeAllPageRolesById } = useContext(PagesContext)

  const iframes = useMemo(
    () =>
      Array.from(
        new Map(
          roleReports.filter(({ type }) => type === PageTypesEnum.Iframe).map(iframe => [iframe.iframe_title, iframe])
        ).values()
      ),
    [roleReports]
  )

  const [workspace, setWorkspace] = useState<WorkspaceType | null>(null)
  const [report, setReport] = useState<PowerBiReportType | null>(null)
  const [rowLevelRole, setRowLevelRole] = useState<string>('')
  const [pageType, setPageType] = useState(PageTypesEnum.PowerBiReport)
  const [iframeTitle, setIframeTitle] = useState('')
  const [iframeHtml, setIframeHtml] = useState('')
  const [hyperlinkUrl, setHyperlinkUrl] = useState('')
  const [hyperlinkTitle, setHyperlinkTitle] = useState('')
  const [hyperlinkNewTab, setHyperlinkNewTab] = useState(true)
  const [previewPage, setPreviewPage] = useState(false)
  const [roles, setRoles] = useState<RoleType[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openRemoveModal, setOpenRemoveModal] = useState(false)
  const [selectedCurrentIframe, setSelectedCurrentIframe] = useState<null | RoleReportsType>(null)

  const isPowerBI = pageType === PageTypesEnum.PowerBiReport || pageType === PageTypesEnum.PowerBiPaginated

  const validateUrl = (url: string) => {
    return urlRegex.test(url)
  }

  const reportsFilteredByType = useMemo(() => {
    switch (pageType) {
      case PageTypesEnum.PowerBiReport: {
        return reportsByWorkspace.filter((report: any) => report.reportType === ReportTypes.PowerBiReport)
      }

      case PageTypesEnum.PowerBiPaginated: {
        return reportsByWorkspace.filter((report: any) => report.reportType === ReportTypes.PowerBiPaginatedReport)
      }

      default:
        return reportsByWorkspace
    }
  }, [pageType, reportsByWorkspace])

  useEffect(() => {
    if (workspace?.id) {
      getInitialReportsAndDatasets(`${workspace.id}`)
    }
  }, [workspace?.id])

  useEffect(() => {
    if (pageReportToUpdate) {
      setWorkspace(workspaces.find((w: any) => w.id === pageReportToUpdate.workspace_id))
      setReport({
        name: pageReportToUpdate.report || '',
        id: pageReportToUpdate.report_id || '',
        datasetId: pageReportToUpdate.dataset_id
      })
      setRowLevelRole(pageReportToUpdate.row_level_role || '')
      setPageType((pageReportToUpdate.type as PageTypesEnum) || PageTypesEnum.PowerBiReport)
      setIframeTitle(pageReportToUpdate.iframe_title || '')
      setIframeHtml(pageReportToUpdate.iframe_html || '')
      setHyperlinkTitle(pageReportToUpdate.hyperlink_title || '')
      setHyperlinkUrl(pageReportToUpdate.hyperlink_url || '')
      setHyperlinkNewTab(pageReportToUpdate.hyperlink_new_tab ?? true)
      setPreviewPage(pageReportToUpdate.preview_pages)
      setRoles(pageReportToUpdate.roles)
    } else {
      setWorkspace(null)
      setReport(null)
      setRowLevelRole('')
      setIframeTitle('')
      setIframeHtml('')
      setHyperlinkTitle('')
      setHyperlinkUrl('')
      setHyperlinkNewTab(true)
      setPreviewPage(false)
      setRoles([])
    }
  }, [pageReportToUpdate])

  useEffect(() => {
    if (pageType === PageTypesEnum.Iframe && rowLevelRole) {
      setRowLevelRole('')
    }
  }, [pageType])

  const openRoleMenu = Boolean(anchorEl)

  const filteredRoles = useMemo(() => allRoles.filter(({ id }) => !roles.find(r => r.id === id)), [allRoles, roles])

  const handleSelectRole = (newRole: RoleType) => {
    setRoles([...roles, newRole])
    setAnchorEl(null)
  }

  const handleOpenRoleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const onSave = async () => {
    if (!roles.length && !roleAddingDisabled) {
      toast.error('Please select at least one role')

      return
    }

    if (pageType === PageTypesEnum.Hyperlink) {
      if (!validateUrl(hyperlinkUrl)) {
        toast.error('Please enter a valid URL')

        return
      }
      if (!hyperlinkTitle) {
        toast.error('Please enter a hyperlink title')

        return
      }
    }

    if (
      (isPowerBI && workspace && report) ||
      (pageType === PageTypesEnum.Iframe && iframeHtml && iframeTitle) ||
      (pageType === PageTypesEnum.Hyperlink && hyperlinkUrl && hyperlinkTitle)
    ) {
      const error = await handleProcessed(
        pageType,
        workspace,
        report,
        iframeHtml,
        iframeTitle,
        hyperlinkUrl,
        hyperlinkTitle,
        hyperlinkNewTab,
        roles,
        rowLevelRole,
        previewPage
      )

      if (error) {
        toast.error(error)
      } else {
        setWorkspace(null)
        setReport(null)
        setRowLevelRole('')
        setIframeTitle('')
        setIframeHtml('')
        setHyperlinkTitle('')
        setHyperlinkUrl('')
        setHyperlinkNewTab(true)
        setPreviewPage(false)
        setRoles([])

        onClose()
      }
    }
  }

  const removeHandler = async () => {
    if (pageReportToUpdate?.id) {
      await removeAllPageRolesById([pageReportToUpdate.id])

      setOpenRemoveModal(false)
      onClose()
    }
  }

  const disabledSaveButton = isPowerBI
    ? !workspace || !report
    : pageType === PageTypesEnum.Iframe
    ? !iframeHtml || !iframeTitle
    : pageType === PageTypesEnum.Hyperlink
    ? !hyperlinkUrl || !hyperlinkTitle || !validateUrl(hyperlinkUrl)
    : false

  return (
    <>
      <CustomDialog open={open} handleClose={onClose} fullWidth maxWidth='lg'>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center', pr: 6 }}>
            <Typography variant='h3' sx={{ fontSize: '18px', lineHeight: '22px' }}>
              Add page
            </Typography>

            <Box sx={{ display: 'flex', alignContent: 'center', gap: 2 }}>
              <Button variant='contained' disabled={disabledSaveButton} onClick={onSave}>
                Save
              </Button>

              <Button variant='outlined' onClick={onClose}>
                Cancel
              </Button>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <CustomTextField
              select
              fullWidth
              defaultValue=''
              value={pageType}
              label='Page Type:'
              sx={{
                '.MuiInputBase-root': {
                  '.MuiButtonBase-root': {
                    display: 'none'
                  }
                },

                '.MuiFormLabel-root': {
                  overflow: 'visible'
                }
              }}
              SelectProps={{
                onChange: e => {
                  setPageType(`${e.target.value}` as PageTypesEnum)
                }
              }}
            >
              <MenuItem value={PageTypesEnum.PowerBiReport}>Power BI Report</MenuItem>

              <MenuItem value={PageTypesEnum.PowerBiPaginated}>Power BI Paginated Report</MenuItem>

              <MenuItem value={PageTypesEnum.Iframe}>Iframe</MenuItem>

              <MenuItem value={PageTypesEnum.Hyperlink}>Hyperlink</MenuItem>
            </CustomTextField>
          </Box>

          {isPowerBI && (
            <>
              <Box sx={{ mt: 4 }}>
                <AutocompleteInput
                  value={workspace}
                  onChange={v => setWorkspace(v)}
                  placeholder='Enter workspace name'
                  label='Workspace Name'
                  getOptionLabel={option => option.name}
                  options={workspaces}
                />
              </Box>

              <Box sx={{ mt: 4 }}>
                <AutocompleteInput
                  value={report}
                  onChange={v => setReport(v)}
                  placeholder='Enter report name'
                  label='Report Name'
                  getOptionLabel={option => option.name}
                  options={reportsFilteredByType}
                />
              </Box>
              <Box sx={{ mt: 4 }}>
                <CustomTextField
                  value={rowLevelRole}
                  onChange={e => setRowLevelRole(e.target.value)}
                  placeholder='Enter Row Level Role'
                  label='Row Level Role'
                  fullWidth
                />
              </Box>

              <FormControlLabel
                label='Preview Pages'
                sx={{
                  mt: 4,
                  '.MuiTypography-root': {
                    fontSize: '14px'
                  }
                }}
                control={
                  <Checkbox
                    checked={previewPage}
                    onChange={e => setPreviewPage(e.target.checked)}
                    sx={{ svg: { width: '32px', height: '32px' } }}
                  />
                }
              />
            </>
          )}

          {pageType === PageTypesEnum.Iframe && (
            <>
              <Box sx={{ mt: 4 }}>
                <CustomTextField
                  select
                  fullWidth
                  defaultValue=''
                  value={selectedCurrentIframe?.iframe_title || ''}
                  label='Current Iframes:'
                  sx={{
                    '.MuiInputBase-root': {
                      '.MuiButtonBase-root': {
                        display: 'none'
                      }
                    },

                    '.MuiFormLabel-root': {
                      overflow: 'visible'
                    }
                  }}
                >
                  {iframes.map(iframe => (
                    <MenuItem
                      value={iframe.iframe_title || ''}
                      key={iframe.id}
                      onClick={() => {
                        setSelectedCurrentIframe(iframe)
                        setIframeTitle(iframe.iframe_title!)
                        setIframeHtml(iframe.iframe_html!)
                      }}
                    >
                      {iframe.iframe_title}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Box>

              <Box sx={{ mt: 4 }}>
                <CustomTextField
                  label='Iframe Title'
                  placeholder='Enter Iframe Title'
                  value={iframeTitle}
                  onChange={e => setIframeTitle(e.target.value)}
                  fullWidth
                />
              </Box>

              <Box sx={{ mt: 4 }}>
                <HtmlEditor htmlText={iframeHtml} onChange={newHtml => setIframeHtml(newHtml)} />
              </Box>
            </>
          )}

          {pageType === PageTypesEnum.Hyperlink && (
            <>
              <Box sx={{ mt: 4 }}>
                <CustomTextField
                  label='Hyperlink Title'
                  placeholder='Enter Hyperlink Title'
                  value={hyperlinkTitle}
                  onChange={e => setHyperlinkTitle(e.target.value)}
                  error={!hyperlinkTitle}
                  helperText={!hyperlinkTitle ? 'Title is required' : ''}
                  fullWidth
                />
              </Box>
              <Box sx={{ mt: 4 }}>
                <CustomTextField
                  label='URL'
                  placeholder='Enter URL (e.g. https://www.domain.com)'
                  value={hyperlinkUrl}
                  onChange={e => setHyperlinkUrl(e.target.value)}
                  error={hyperlinkUrl !== '' && !validateUrl(hyperlinkUrl)}
                  helperText={hyperlinkUrl !== '' && !validateUrl(hyperlinkUrl) ? 'Please enter a valid URL' : ''}
                  fullWidth
                />
              </Box>
              <FormControlLabel
                label='Open in new tab'
                sx={{
                  mt: 4,
                  '.MuiTypography-root': {
                    fontSize: '14px'
                  }
                }}
                control={
                  <Checkbox
                    checked={hyperlinkNewTab}
                    onChange={e => setHyperlinkNewTab(e.target.checked)}
                    sx={{ svg: { width: '32px', height: '32px' } }}
                  />
                }
              />
            </>
          )}

          <Box sx={{ mt: 6 }}>
            <Typography>Roles</Typography>

            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
              {roles.map(role => (
                <ChipItem
                  key={role.id}
                  size='medium'
                  label={role.role}
                  color='primary'
                  onDelete={!roleAddingDisabled ? () => setRoles(roles.filter(r => r.id !== role.id)) : undefined}
                />
              ))}

              <Button
                variant='outlined'
                size='small'
                sx={{ borderRadius: 4 }}
                id='role-button'
                onClick={handleOpenRoleMenu}
                disabled={roleAddingDisabled}
              >
                Add Role +
              </Button>

              <Menu
                id='basic-role-menu'
                anchorEl={anchorEl}
                open={openRoleMenu}
                onClose={() => setAnchorEl(null)}
                MenuListProps={{
                  sx: { maxHeight: '200px' }
                }}
              >
                {filteredRoles.map(role => (
                  <MenuItem key={role.id} onClick={() => handleSelectRole(role)}>
                    {role.role}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, width: '100%', mt: 8 }}>
            <Box sx={{ display: 'flex', gap: 6, pl: 12 }}>
              {pageType !== PageTypesEnum.Iframe && pageType !== PageTypesEnum.Hyperlink && pageReportToUpdate && (
                <>
                  <Box>
                    <Typography>Last refresh status</Typography>

                    <Typography sx={{ textAlign: 'center' }}>
                      {pageReportToUpdate?.last_refresh_status
                        ? uppercaseFirstLetter(pageReportToUpdate.last_refresh_status)
                        : 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography>Last refresh date</Typography>

                    <Typography sx={{ textAlign: 'center' }}>
                      {pageReportToUpdate?.last_refresh_date
                        ? moment(pageReportToUpdate.last_refresh_date).format('YYYY/MM/DD - HH:mm:ss')
                        : '-'}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            {!isAdd && (
              <Button variant='outlined' color='error' onClick={() => setOpenRemoveModal(true)}>
                Delete Page
              </Button>
            )}
          </Box>
        </DialogActions>
      </CustomDialog>

      <ConfirmationDialog
        open={openRemoveModal}
        onClose={() => setOpenRemoveModal(false)}
        onHandleConfirm={removeHandler}
        title='Delete page?'
      />
    </>
  )
}

export default PagesModal
