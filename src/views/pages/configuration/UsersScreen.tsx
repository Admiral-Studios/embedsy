import React, { useContext, useMemo, useState } from 'react'
import { Box, Button, CircularProgress, DialogContent, Grid, Typography } from '@mui/material'
import ConfirmationDialog from 'src/components/shared/ConfirmationDialog'
import { RoleReportsType, RoleType, UserType } from 'src/types/types'
import CustomTextField from 'src/@core/components/mui/text-field'
import useDebounce from 'src/hooks/useDebounce'
import AddEditUserModal from './components/AddEditUserModal'
import CustomDialog from 'src/components/shared/CustomDialog'
import DensityButtons from './components/DensityButtons'
import ItemList from 'src/components/shared/ItemList'
import ItemCard from 'src/components/shared/ItemCard'
import ChipItem from 'src/components/shared/ChipItem'
import UploadUserRolesModal from './components/UploadUserRolesModal'
import { CONFIG_ITEMS_PER_PAGE } from 'src/constants/pagination'
import { DensityTypes } from './types/types'
import { useSwitchableSetOfIds } from 'src/hooks/useSwitchableSetOfIds'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { UsersContext } from 'src/context/UserConfiguration/UsersContext'
import { RolesContext } from 'src/context/UserConfiguration/RolesContext'
import { PermanentRoles } from 'src/context/types'

const UsersScreen = () => {
  const { removeUsers, addUpdateUser, locallyAddNewUsers, users, deleteUsersFromPortal } = useContext(UsersContext)
  const { removeRoles } = useContext(RolesContext)

  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [openAddModal, setOpenAddModal] = useState(false)
  const [openRemoveModal, setOpenRemoveModal] = useState(false)
  const [visibleUsers, setVisibleUsers] = useState(CONFIG_ITEMS_PER_PAGE)
  const [roleToRemove, setRoleToRemove] = useState<RoleType | null>(null)
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null)
  const [userToDeleteRole, setUserToDeleteRole] = useState<string | null>(null)
  const [userToUpdate, setUserToUpdate] = useState<UserType | null>(null)
  const [rolePages, setRolePages] = useState<RoleReportsType[] | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [density, setDensity] = useState<DensityTypes>('standard')

  const [searchTerm, setSearchTerm] = useState('')

  const debouncedSearch = useDebounce(searchTerm, 500)

  const searchedUsers = useMemo(
    () => users.filter(({ email }) => email.toLowerCase().includes(debouncedSearch.toLowerCase().trim())),
    [debouncedSearch, users]
  )

  const { ids: loadedRolesUsersIds, toggleId: toggleRoleId } = useSwitchableSetOfIds()
  const { ids: loadedPagesUsersIds, toggleId: togglePageId } = useSwitchableSetOfIds()

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(prevId => prevId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const loadMore = () => {
    setVisibleUsers(Math.min(visibleUsers + CONFIG_ITEMS_PER_PAGE, searchedUsers.length))
  }

  const loadAll = () => {
    setVisibleUsers(searchedUsers.length)
  }

  const removeRoleHandler = async () => {
    if (roleToRemove) await removeRoles([roleToRemove.id])

    setRoleToRemove(null)
  }

  const removeHandler = async () => {
    if (userIdToDelete) {
      await removeUsers([userIdToDelete])
      setUserIdToDelete(null)
      setSelectedIds(prev => prev.filter(prevId => prevId !== userIdToDelete))
    } else {
      await removeUsers(selectedIds)
      setSelectedIds([])
      setOpenRemoveModal(false)
    }
  }

  const deleteUserFromPortalHandler = async () => {
    if (userIdToDelete) {
      await deleteUsersFromPortal([userIdToDelete])
      setUserIdToDelete(null)
      setSelectedIds(prev => prev.filter(prevId => prevId !== userIdToDelete))
    } else {
      await deleteUsersFromPortal(selectedIds)
      setSelectedIds([])
      setOpenRemoveModal(false)
    }
  }
  const addEditUser = async (user: UserType | null, email: string, roles: RoleType[]) => {
    await addUpdateUser(user, email, roles)
  }

  const clickEditButton = (role: UserType) => {
    setUserToUpdate(role)

    setOpenAddModal(true)
  }

  if (!users.length)
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
            <Grid item md={4} xs={12}>
              <CustomTextField
                label='Search By Email'
                placeholder='Enter Search Term'
                fullWidth
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </Grid>

            <Grid item md={8} xs={12}>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 2
                }}
              >
                <Button variant='contained' onClick={() => setIsUploadModalOpen(true)}>
                  Upload Users
                </Button>

                <Button variant='contained' onClick={() => setOpenAddModal(true)}>
                  Add User
                </Button>

                <Button
                  variant='contained'
                  color='error'
                  disabled={!selectedIds.length}
                  onClick={() => setOpenRemoveModal(true)}
                >
                  Delete Users
                </Button>

                <DensityButtons density={density} onChangeDensity={d => setDensity(d)} />
              </Box>
            </Grid>
          </Grid>
        }
      >
        {searchedUsers.slice(0, visibleUsers).map(user => (
          <ItemCard
            key={user.id}
            checked={selectedIds.includes(user?.id)}
            onSelect={handleSelect}
            id={user?.id}
            title={user.email}
            density={density}
            showCheckbox={user?.role === PermanentRoles.guest ? false : true}
            topControls={
              <>
                <Button variant='outlined' onClick={() => clickEditButton(user)}>
                  Edit User
                </Button>

                <Button
                  variant='outlined'
                  color='error'
                  onClick={() => {
                    setUserToDeleteRole(user?.role)
                    setUserIdToDelete(user.id)
                  }}
                >
                  Delete User
                </Button>
              </>
            }
          >
            <Box sx={{ mt: 4, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
              {(loadedRolesUsersIds.has(user.id) ? user.roles : user.roles.slice(0, 10))?.map(role => (
                <ChipItem
                  variant='outlined'
                  key={role.id}
                  size='medium'
                  label={role.role}
                  onClick={e => {
                    e.stopPropagation()
                    setRolePages(user.pages.filter(({ role_id }) => role_id === role.id))
                  }}
                  onDelete={
                    ![PermanentRoles.guest, PermanentRoles.admin, PermanentRoles.super_admin].includes(
                      role.role as PermanentRoles
                    )
                      ? () => setRoleToRemove(role)
                      : undefined
                  }
                  color='primary'
                  sx={{
                    '&:hover': {
                      backgroundColor: '#FFC815',
                      boxShadow: '0px 2px 4px 0px rgba(29, 29, 29, 0.251)'
                    }
                  }}
                />
              ))}

              {user.roles?.length > 10 && (
                <Button variant='contained' size='small' sx={{ borderRadius: 4 }} onClick={() => toggleRoleId(user.id)}>
                  {loadedRolesUsersIds.has(user.id) ? 'Hide' : 'Show More'}
                </Button>
              )}

              {/* <Button variant='outlined' size='small' sx={{ borderRadius: 4 }}>
                Assign Roles +
              </Button> */}
            </Box>

            <Box sx={{ mt: 8, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
              {(loadedPagesUsersIds.has(user.id) ? user.pages : user.pages.slice(0, 10))?.map(page => (
                <ChipItem
                  key={page.id}
                  size='medium'
                  label={
                    page.type === PageTypesEnum.Iframe
                      ? page.iframe_title
                      : page.type === PageTypesEnum.Hyperlink
                      ? page.hyperlink_title
                      : page.report
                  }
                  color={
                    page.type === PageTypesEnum.Iframe
                      ? 'info'
                      : page.type === PageTypesEnum.Hyperlink
                      ? 'warning'
                      : 'primary'
                  }
                />
              ))}

              {user.pages?.length > 10 && (
                <Button variant='contained' size='small' sx={{ borderRadius: 4 }} onClick={() => togglePageId(user.id)}>
                  {loadedPagesUsersIds.has(user.id) ? 'Hide' : 'Show More'}
                </Button>
              )}
            </Box>
          </ItemCard>
        ))}
      </ItemList>

      {visibleUsers < searchedUsers.length && (
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
        open={!!roleToRemove}
        onClose={() => setRoleToRemove(null)}
        onHandleConfirm={removeRoleHandler}
        title={`Delete ${roleToRemove?.role} role for user?`}
      />

      <ConfirmationDialog
        open={openRemoveModal || !!userIdToDelete}
        onClose={() => {
          if (userIdToDelete) {
            setUserIdToDelete(null)
            setUserToDeleteRole(null)
          } else {
            setOpenRemoveModal(false)
          }
        }}
        onHandleSecondaryConfirm={
          userToDeleteRole && userToDeleteRole !== PermanentRoles.guest ? removeHandler : undefined
        }
        secondaryConfirmLabel={
          userToDeleteRole && userToDeleteRole !== PermanentRoles.guest
            ? selectedIds?.length <= 1
              ? 'Remove User From Role'
              : 'Remove Users From Roles'
            : undefined
        }
        onHandleConfirm={deleteUserFromPortalHandler}
        confirmLabel={selectedIds?.length <= 1 ? 'Delete User From Portal' : 'Delete Users From Portal'}
        title={selectedIds?.length <= 1 ? 'Delete User?' : 'Delete Users?'}
        direction='column'
        buttonVariant='contained'
      />

      <AddEditUserModal
        userToUpdate={userToUpdate}
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false)
          setUserToUpdate(null)
        }}
        handleProcessed={addEditUser}
      />

      <CustomDialog open={!!rolePages} handleClose={() => setRolePages(null)} fullWidth maxWidth='md'>
        <DialogContent>
          <Typography variant='h3' sx={{ fontSize: '18px', pt: 2, lineHeight: '22px', mb: 4 }}>
            Pages
          </Typography>

          {rolePages &&
            rolePages.map(page => (
              <Typography
                color={page.type === PageTypesEnum.Iframe ? '#00CFE8' : 'primary'}
                key={page.id}
                sx={{ py: 2 }}
              >
                {page.type === PageTypesEnum.Iframe ? page.iframe_title : page.report}
              </Typography>
            ))}
        </DialogContent>
      </CustomDialog>

      <UploadUserRolesModal
        open={isUploadModalOpen}
        handleClose={() => setIsUploadModalOpen(false)}
        updateLocalListOnSuccess={locallyAddNewUsers}
      />
    </>
  )
}

export default UsersScreen
