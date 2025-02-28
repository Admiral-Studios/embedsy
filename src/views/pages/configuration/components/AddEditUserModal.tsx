import { Box, Button, DialogActions, DialogContent, Menu, MenuItem, Typography } from '@mui/material'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomDialog from 'src/components/shared/CustomDialog'
import { RoleType, UserType } from 'src/types/types'
import ChipItem from 'src/components/shared/ChipItem'
import { emailRegex } from 'src/utils/regex'
import { PageTypesEnum } from 'src/enums/pageTypes'
import { RolesContext } from 'src/context/UserConfiguration/RolesContext'

type Props = {
  open: boolean
  onClose: () => void
  handleProcessed: (user: UserType | null, email: string, roles: RoleType[]) => Promise<void>
  userToUpdate: UserType | null
}

const AddEditUserModal = ({ open, onClose, userToUpdate, handleProcessed }: Props) => {
  const isAdd = !userToUpdate?.id

  const { roles: allRoles, roleReports } = useContext(RolesContext)

  const [email, setEmail] = useState('')
  const [roles, setRoles] = useState<RoleType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const pages = useMemo(
    () => roleReports.filter(report => roles.find(role => role.id === report.role_id)),
    [roleReports, roles]
  )

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loadMorePages, setLoadMorePages] = useState(false)

  const openRoleMenu = Boolean(anchorEl)

  const filteredRoles = useMemo(() => allRoles.filter(({ id }) => !roles.find(r => r.id === id)), [allRoles, roles])

  const handleSelectRole = (newRole: RoleType) => {
    setRoles([...roles, newRole])
    setAnchorEl(null)
  }

  const handleOpenRoleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    onClose()
    setEmail('')
    setRoles([])
  }

  const onProcessed = async () => {
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email')

      return
    }

    setIsLoading(true)

    await handleProcessed(userToUpdate, email, roles)

    setRoles([])
    setEmail('')
    onClose()

    setIsLoading(false)
  }

  useEffect(() => {
    if (userToUpdate) {
      setEmail(userToUpdate.email)
      setRoles(userToUpdate.roles)
    }
  }, [userToUpdate])

  return (
    <CustomDialog open={open} handleClose={handleClose} fullWidth maxWidth='lg'>
      <DialogContent>
        <Typography variant='h3' sx={{ fontSize: '18px', pt: 2, lineHeight: '22px' }}>
          {isAdd ? 'Add' : 'Edit'} user
        </Typography>

        <Box sx={{ mt: 4 }}>
          <CustomTextField
            placeholder='Add email address'
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </Box>

        <Box sx={{ mt: 8, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
          {roles?.map(role => (
            <ChipItem
              variant='outlined'
              key={role.id}
              size='medium'
              label={role.role}
              onDelete={() => setRoles(roles.filter(r => r.id !== role.id))}
              color='primary'
            />
          ))}

          <Button
            variant='outlined'
            size='small'
            sx={{ borderRadius: 4 }}
            id='role-button'
            onClick={handleOpenRoleMenu}
            disabled={!!roles.length}
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

        <Box sx={{ mt: 8, display: 'flex', gap: 2, alignContent: 'center', flexWrap: 'wrap' }}>
          {(loadMorePages ? pages : pages.slice(0, 10))?.map(page => (
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

          {pages?.length > 10 && (
            <Button
              variant='contained'
              size='small'
              sx={{ borderRadius: 4 }}
              onClick={() => setLoadMorePages(!loadMorePages)}
            >
              {loadMorePages ? 'Hide' : 'Show More'}
            </Button>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant='outlined' disabled={!email || !roles.length || isLoading} onClick={onProcessed}>
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  )
}

export default AddEditUserModal
