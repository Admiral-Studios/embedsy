import { useContext, useMemo, useState } from 'react'
import { Box, Button, CircularProgress, Grid, IconButton, Tooltip } from '@mui/material'
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog'
import AddRoleModal from './components/AddRoleModal'
import AddUserModal from './components/AddUserModal'
import { CreationPageType, PowerBiReportType, RoleType, RoleWithUsersPagesType, WorkspaceType } from 'src/types/types'
import PagesModal from './components/PagesModal'
import { emptyPageObject } from './utils/emptyPageObject'
import useDebounce from 'src/hooks/useDebounce'
import CustomTextField from 'src/@core/components/mui/text-field'
import DensityButtons from './components/DensityButtons'
import ItemList from 'src/components/shared/ItemList'
import ItemCard from 'src/components/shared/ItemCard'
import ChipItem from 'src/components/shared/ChipItem'
import { CONFIG_ITEMS_PER_PAGE } from 'src/constants/pagination'
import { DensityTypes } from './types/types'
import { useSwitchableSetOfIds } from 'src/hooks/useSwitchableSetOfIds'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { PagesContext } from 'src/context/UserConfiguration/PagesContext'
import { UsersContext } from 'src/context/UserConfiguration/UsersContext'
import { RolesContext } from 'src/context/UserConfiguration/RolesContext'
import { PermanentRoles } from 'src/context/types'
import { Icon } from '@iconify/react'

const RolesScreen = () => {
  const { addUpdatePage, removePagesById } = useContext(PagesContext)
  const { assignUserToRole, removeUsers, deleteUsersFromPortal, userRoles } = useContext(UsersContext)
  const { addNewRole, removeRoles, allRolesData } = useContext(RolesContext)

  const allUsersEmails = userRoles.map(({ email }) => email)

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openRemoveModal, setOpenRemoveModal] = useState(false)
  const [visibleRoles, setVisibleRoles] = useState(CONFIG_ITEMS_PER_PAGE)
  const [roleIdToDelete, setRoleIdToDelete] = useState<number | null>(null)
  const [roleIdToAssignUser, setRoleIdToAssignUser] = useState<number | null>(null)
  const [roleToAssignUser, setRoleToAssignUser] = useState<RoleWithUsersPagesType | null>(null)
  const [pageToAdd, setPageToAdd] = useState<CreationPageType | null>(null)
  const [roleToUpdate, setRoleToUpdate] = useState<RoleWithUsersPagesType | null>(null)
  const [pageToDelete, setPageToDelete] = useState<{ id: number; name: string } | null>(null)
  const [density, setDensity] = useState<DensityTypes>('standard')
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null)

  const { ids: loadedUsersRolesIds, toggleId: toggleRoleId } = useSwitchableSetOfIds()

  const [searchTerm, setSearchTerm] = useState('')

  const debouncedSearch = useDebounce(searchTerm, 500)

  const searchedRoles = useMemo(
    () => allRolesData.filter(({ role }) => role.toLowerCase().includes(debouncedSearch.toLowerCase().trim())),
    [debouncedSearch, allRolesData]
  )

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(prevId => prevId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const loadMore = () => {
    setVisibleRoles(Math.min(visibleRoles + CONFIG_ITEMS_PER_PAGE, searchedRoles.length))
  }

  const loadAll = () => {
    setVisibleRoles(searchedRoles.length)
  }

  const removeHandler = async () => {
    if (roleIdToDelete) {
      await removeRoles([roleIdToDelete])
      setRoleIdToDelete(null)
      setSelectedIds(prev => prev.filter(prevId => prevId !== roleIdToDelete))
    } else {
      await removeRoles(selectedIds)
      setSelectedIds([])
      setOpenRemoveModal(false)
    }
  }

  const handleAssignUsersClick = (role: RoleWithUsersPagesType) => {
    setRoleIdToAssignUser(role.id)
    setRoleToAssignUser(role)
  }

  const handleAssignUsers = async (emails: string[]) => {
    if (roleIdToAssignUser) {
      await Promise.all(emails.map(email => assignUserToRole(roleIdToAssignUser, email)))
    }
  }

  const handleAddPage = (role: string, role_id: number) => {
    const newPage: CreationPageType = {
      ...emptyPageObject,
      roles: [
        {
          role,
          id: role_id,
          can_refresh: null,
          can_export: null,
          parentPageId: null,
          can_manage_own_account: null
        }
      ]
    }

    setPageToAdd(newPage)
  }

  // todo: refactor this, duplicate found in PagesScreen, AddRoleModal
  const onSaveUpdatePage = async (
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
    if (
      pageType === PageTypesEnum.PowerBiReport
        ? workspace && report
        : pageType === PageTypesEnum.Hyperlink
        ? hyperlinkUrl && hyperlinkTitle
        : iframeHtml && iframeTitle
    ) {
      const { error } = await addUpdatePage({
        id: pageToAdd?.id,
        workspace,
        report,
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
      })

      return error
    }

    return null
  }

  const clickEditButton = (role: RoleWithUsersPagesType) => {
    setRoleToUpdate(role)

    setOpenAddModal(true)
  }

  const removePageHandler = async () => {
    if (pageToDelete?.id) {
      await removePagesById([pageToDelete?.id])
      setPageToDelete(null)
    }
  }

  const removeUserFromRoleHandler = async () => {
    await removeUsers([userIdToDelete!])

    setUserIdToDelete(null)
  }

  const deleteUserFromPortalHandler = async () => {
    await deleteUsersFromPortal([userIdToDelete!])

    setUserIdToDelete(null)
  }

  if (!allRolesData.length)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )

  return (
    <>
      <ItemList
        controls={
          <Grid container spacing={8} mb={6} sx={{ alignItems: 'flex-end' }}>
            <Grid item md={6} xs={12}>
              <CustomTextField
                label='Search By Role Name'
                placeholder='Enter Search Term'
                fullWidth
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 2
                }}
              >
                <Button variant='contained' onClick={() => setOpenAddModal(true)}>
                  Add Role
                </Button>

                <Button
                  variant='contained'
                  color='error'
                  disabled={!selectedIds.length}
                  onClick={() => setOpenRemoveModal(true)}
                >
                  Delete Roles
                </Button>

                <DensityButtons density={density} onChangeDensity={d => setDensity(d)} />
              </Box>
            </Grid>
          </Grid>
        }
      >
        {searchedRoles.slice(0, visibleRoles).map(role => (
          <ItemCard
            key={role.id}
            checked={selectedIds.includes(role?.id)}
            onSelect={handleSelect}
            id={role?.id}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {Object.values(PermanentRoles).includes(role.role as PermanentRoles) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pr: 6 }}>
                    <Tooltip title='This is a default portal role. It cannot be renamed or deleted.'>
                      <IconButton>
                        <Icon icon='tabler:info-circle' fontSize={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                <span>{role?.role}</span>
              </Box>
            }
            density={density}
            showCheckbox={!Object.values(PermanentRoles).includes(role.role as PermanentRoles)}
            topControls={
              <>
                <Button variant='outlined' onClick={() => clickEditButton(role)}>
                  Edit Role
                </Button>

                {!Object.values(PermanentRoles).includes(role.role as PermanentRoles) && (
                  <Button variant='outlined' color='error' onClick={() => setRoleIdToDelete(role.id)}>
                    Delete Role
                  </Button>
                )}
              </>
            }
          >
            <Box sx={{ mt: 4, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
              {(loadedUsersRolesIds.has(role.id) ? role?.users : role.users.slice(0, 10))?.map(user => (
                <ChipItem
                  variant='outlined'
                  key={user.id}
                  size='medium'
                  label={user.email}
                  onDelete={role.role !== PermanentRoles.guest ? async () => setUserIdToDelete(user.id) : undefined}
                  color='primary'
                />
              ))}

              {role.users?.length > 10 && (
                <Button variant='contained' sx={{ borderRadius: 4 }} size='small' onClick={() => toggleRoleId(role.id)}>
                  {loadedUsersRolesIds.has(role.id) ? 'Hide' : 'Show More'}
                </Button>
              )}

              {role.role !== PermanentRoles.guest && (
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => handleAssignUsersClick(role)}
                  sx={{ borderRadius: 4 }}
                >
                  Assign Users +
                </Button>
              )}
            </Box>

            <Box sx={{ mt: 8, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
              {role?.pages.map(p => (
                <ChipItem
                  key={p.id}
                  size='medium'
                  label={
                    p.type === PageTypesEnum.Iframe
                      ? p.iframe_title
                      : p.type === PageTypesEnum.Hyperlink
                      ? p.hyperlink_title
                      : p.report
                  }
                  color={
                    p.type === PageTypesEnum.Iframe
                      ? 'info'
                      : p.type === PageTypesEnum.Hyperlink
                      ? 'warning'
                      : 'primary'
                  }
                  onDelete={() => {
                    setPageToDelete({
                      id: p.id,
                      name:
                        p.type === PageTypesEnum.Iframe
                          ? p.iframe_title || ''
                          : p.type === PageTypesEnum.Hyperlink
                          ? p.hyperlink_title || ''
                          : p.report || ''
                    })
                  }}
                />
              ))}

              <Button
                variant='outlined'
                size='small'
                sx={{ borderRadius: 4 }}
                onClick={() => handleAddPage(role.role, role.id)}
              >
                Add Page +
              </Button>
            </Box>
          </ItemCard>
        ))}
      </ItemList>

      {visibleRoles < searchedRoles.length && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, mt: 6 }}>
          <Button variant='outlined' onClick={loadMore}>
            Load More
          </Button>

          <Button variant='outlined' onClick={loadAll}>
            Load All
          </Button>
        </Box>
      )}

      <ConfirmationDialog
        open={openRemoveModal || !!roleIdToDelete}
        onClose={() => {
          if (roleIdToDelete) {
            setRoleIdToDelete(null)
          } else {
            setOpenRemoveModal(false)
          }
        }}
        onHandleConfirm={removeHandler}
        title={selectedIds?.length <= 1 ? 'Delete role?' : 'Delete roles?'}
      />

      <ConfirmationDialog
        open={!!pageToDelete?.id}
        onClose={() => {
          setPageToDelete(null)
        }}
        onHandleConfirm={removePageHandler}
        title={`Delete page: ${pageToDelete?.name}?`}
      />

      <ConfirmationDialog
        open={!!userIdToDelete}
        onClose={() => setUserIdToDelete(null)}
        onHandleConfirm={deleteUserFromPortalHandler}
        confirmLabel='Delete User From Portal'
        onHandleSecondaryConfirm={removeUserFromRoleHandler}
        secondaryConfirmLabel='Remove User From Role'
        title='Delete User'
        direction='column'
        buttonVariant='contained'
      />

      <AddRoleModal
        roleToUpdate={roleToUpdate}
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false)
          setRoleToUpdate(null)
        }}
        handleProcessed={addNewRole}
        allUsersEmails={allUsersEmails}
      />

      <AddUserModal
        open={!!roleIdToAssignUser}
        roleToAssignUser={roleToAssignUser}
        allUsersEmails={allUsersEmails}
        onClose={() => setRoleIdToAssignUser(null)}
        handleProcessed={handleAssignUsers}
      />

      <PagesModal
        handleProcessed={onSaveUpdatePage}
        open={!!pageToAdd}
        pageReportToUpdate={pageToAdd}
        onClose={() => setPageToAdd(null)}
        roleAddingDisabled={true}
      />
    </>
  )
}

export default RolesScreen
