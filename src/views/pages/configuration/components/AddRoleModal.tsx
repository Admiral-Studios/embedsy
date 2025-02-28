import { Box, Button, Checkbox, DialogActions, DialogContent, FormControlLabel, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CustomDialog from 'src/components/shared/CustomDialog'
import CustomTextField from 'src/@core/components/mui/text-field'
import AddUserModal from './AddUserModal'
import { CreationPageType, PowerBiReportType, RoleType, RoleWithUsersPagesType, WorkspaceType } from 'src/types/types'
import { emptyPageObject } from '../utils/emptyPageObject'
import PagesModal from './PagesModal'
import ChipItem from 'src/components/shared/ChipItem'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { PermanentRoles } from 'src/context/types'

type Props = {
  open: boolean
  onClose: () => void
  handleProcessed: (
    id: number | null,
    r: string,
    cr: boolean,
    ce: boolean,
    cm: boolean,
    users?: string[],
    pages?: CreationPageType[]
  ) => Promise<'error' | 'success'>
  roleToUpdate: RoleWithUsersPagesType | null
  allUsersEmails?: string[]
}

const AddRoleModal = ({ open, onClose, handleProcessed, roleToUpdate, allUsersEmails }: Props) => {
  const isAdd = !roleToUpdate?.id

  const [value, setValue] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [canRefresh, setCanRefresh] = useState(false)
  const [canExport, setCanExport] = useState(false)
  const [canManageOwnAccount, setCanManageOwnAccount] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [users, setUsers] = useState<string[]>([])
  const [openAddUserModal, setOpenAddUserModal] = useState(false)

  const [pages, setPages] = useState<CreationPageType[]>([])
  const [pageToAdd, setPageToAdd] = useState<CreationPageType | null>(null)

  const resetStates = () => {
    setValue('')
    setErrMsg('')
    setCanRefresh(false)
    setCanExport(false)
    setCanManageOwnAccount(false)
    setIsLoading(false)
    setUsers([])
    setPages([])
    setPageToAdd(null)
    setOpenAddUserModal(false)
  }

  const handleClose = () => {
    resetStates()
    onClose()
  }

  const onProcessed = async () => {
    setIsLoading(true)

    const result = await handleProcessed(
      roleToUpdate?.id || null,
      value,
      canRefresh,
      canExport,
      canManageOwnAccount,
      users,
      pages
    )

    if (result === 'error') {
      setErrMsg('Role already exist')
    } else {
      handleClose()
    }

    setIsLoading(false)
  }

  const addUsers = async (values: string[]) => {
    setUsers(values)
  }

  const handleCreatePageToAdd = () => {
    const newPage: CreationPageType = {
      ...emptyPageObject,
      roles: roleToUpdate
        ? [
            {
              role: roleToUpdate.role,
              id: roleToUpdate.id,
              can_refresh: roleToUpdate.can_refresh,
              can_export: roleToUpdate.can_export,
              can_manage_own_account: roleToUpdate.can_manage_own_account,
              parentPageId: null
            }
          ]
        : []
    }

    setPageToAdd(newPage)
  }

  // todo: refactor this, duplicate found in PagesScreen, RolesScreen
  const handleAddPage = async (
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
  ) => {
    setPages([
      ...pages,
      {
        ...emptyPageObject,
        id: pageToAdd?.id || null,
        workspace: workspace?.name || '',
        workspace_id: workspace?.id || '',
        report: report?.name || null,
        report_id: report?.id || null,
        dataset_id: report?.datasetId || '',
        iframe_html: iframeHtml,
        iframe_title: iframeTitle,
        hyperlink_url: hyperlinkUrl,
        hyperlink_title: hyperlinkTitle,
        hyperlink_new_tab: hyperlinkNewTab,
        preview_pages: previewPage,
        roles: roles.map(r => ({
          ...r,
          parentPageId: pageToAdd?.roles.find(({ id }) => id === r.id)?.parentPageId || null
        })),
        type: pageType,
        row_level_role: rowLevelRole
      }
    ])

    return null
  }

  useEffect(() => {
    if (roleToUpdate) {
      setValue(roleToUpdate.role)
      setCanRefresh(!!roleToUpdate.can_refresh)
      setCanExport(!!roleToUpdate.can_export)
      setCanManageOwnAccount(!!roleToUpdate.can_manage_own_account)
      setUsers(roleToUpdate.users.map(({ email }) => email))
      setPages(roleToUpdate.pages.map(page => ({ ...page, roles: [] })))
    }
  }, [roleToUpdate])

  return (
    <>
      <CustomDialog open={open} handleClose={handleClose} fullWidth maxWidth='lg'>
        <DialogContent>
          <Typography variant='h3' sx={{ fontSize: '18px', pt: 2, lineHeight: '22px' }}>
            {isAdd ? 'Add' : 'Edit'} role
          </Typography>
          <Box sx={{ mt: 4 }}>
            <CustomTextField
              placeholder='Enter new role name'
              fullWidth
              value={value}
              onChange={e => setValue(e.target.value)}
              error={!!errMsg}
              disabled={Boolean(
                !isAdd &&
                  roleToUpdate?.role &&
                  Object.values(PermanentRoles).includes(roleToUpdate.role as PermanentRoles)
              )}
            />

            <Typography color='error' sx={{ mt: 2 }}>
              {errMsg}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
            <FormControlLabel
              label='Can refresh datasets'
              sx={{
                '.MuiTypography-root': {
                  fontSize: '14px'
                }
              }}
              control={
                <Checkbox
                  checked={canRefresh}
                  onChange={e => setCanRefresh(e.target.checked)}
                  sx={{ svg: { width: '32px', height: '32px' } }}
                />
              }
            />
            <FormControlLabel
              label='Can export reports'
              sx={{
                '.MuiTypography-root': {
                  fontSize: '14px'
                }
              }}
              control={
                <Checkbox
                  checked={canExport}
                  onChange={e => setCanExport(e.target.checked)}
                  sx={{ svg: { width: '32px', height: '32px' } }}
                />
              }
            />
            <FormControlLabel
              label='Can manage own account'
              sx={{
                '.MuiTypography-root': {
                  fontSize: '14px'
                }
              }}
              control={
                <Checkbox
                  checked={canManageOwnAccount}
                  onChange={e => setCanManageOwnAccount(e.target.checked)}
                  sx={{ svg: { width: '32px', height: '32px' } }}
                />
              }
            />
          </Box>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
            {users?.map(user => (
              <ChipItem
                variant='outlined'
                key={user}
                size='medium'
                label={user}
                onDelete={() => setUsers(users.filter(u => u !== user))}
                color='primary'
              />
            ))}

            <Button variant='outlined' size='small' onClick={() => setOpenAddUserModal(true)} sx={{ borderRadius: 4 }}>
              Assign Users +
            </Button>
          </Box>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
            {pages.map(p => (
              <ChipItem
                key={p.id || p.type === PageTypesEnum.Iframe ? p.iframe_title : p.report}
                size='medium'
                label={
                  p.type === PageTypesEnum.Iframe
                    ? p.iframe_title
                    : p.type === PageTypesEnum.Hyperlink
                    ? p.hyperlink_title
                    : p.report
                }
                color={
                  p.type === PageTypesEnum.Iframe ? 'info' : p.type === PageTypesEnum.Hyperlink ? 'warning' : 'primary'
                }
                onDelete={() => setPages(pages.filter(({ id }) => id !== p.id))}
              />
            ))}

            <Button variant='outlined' size='small' sx={{ borderRadius: 4 }} onClick={handleCreatePageToAdd}>
              Add Page +
            </Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>

          <Button variant='outlined' disabled={isLoading || !value} onClick={onProcessed}>
            {isAdd ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </CustomDialog>

      <PagesModal
        open={!!pageToAdd}
        onClose={() => setPageToAdd(null)}
        handleProcessed={handleAddPage}
        roleAddingDisabled
        pageReportToUpdate={pageToAdd}
      />

      <AddUserModal
        open={openAddUserModal}
        onClose={() => setOpenAddUserModal(false)}
        handleProcessed={addUsers}
        allUsersEmails={allUsersEmails || []}
      />
    </>
  )
}

export default AddRoleModal
