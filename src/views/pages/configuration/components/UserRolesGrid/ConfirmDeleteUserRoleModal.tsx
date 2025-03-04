import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import CustomModal from '../../../../../components/shared/CustomModal'
import { styled } from '@mui/material/styles'
import { UserRoles } from './UserRolesGrid'
import { GridRowId } from '@mui/x-data-grid'

const PreviewBoxStyled = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 250,
  overflowY: 'scroll'
}))

const HeaderPreviewBoxStyled = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  padding: theme.spacing(0, 2)
}))

const RowBoxStyled = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  padding: theme.spacing(3, 2)
}))

const ActionBoxStyled = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  gap: theme.spacing(2),
  display: 'flex'
}))

type Props = {
  open: boolean
  userRoleToDelete: UserRoles
  handleClose: () => void
  handleDelete: (insertedRoles: GridRowId) => Promise<void>
}

const ConfirmDeleteUserRoleModal = ({ open, userRoleToDelete, handleClose, handleDelete }: Props) => {
  const handleDeleteUserRole = async () => {
    await handleDelete(userRoleToDelete.id)
    handleClose()
  }

  return (
    <CustomModal open={open} handleClose={handleClose} title='Confirm Delete User Role'>
      <PreviewBoxStyled>
        <HeaderPreviewBoxStyled>
          <Typography sx={{ width: '50%', textAlign: 'left', fontWeight: 'bold' }}>ROLE</Typography>
          <Typography sx={{ width: '50%', textAlign: 'left', fontWeight: 'bold' }}>EMAIL</Typography>
        </HeaderPreviewBoxStyled>
        <RowBoxStyled>
          <Typography sx={{ width: '50%', textAlign: 'left' }}>{userRoleToDelete.role}</Typography>
          <Typography sx={{ width: '50%', textAlign: 'left' }}>{userRoleToDelete.email}</Typography>
        </RowBoxStyled>
      </PreviewBoxStyled>
      <ActionBoxStyled>
        <Button variant='contained' onClick={() => handleDeleteUserRole()} sx={{ mr: 1 }}>
          Delete
        </Button>
        <Button variant='contained' onClick={handleClose}>
          Cancel
        </Button>
      </ActionBoxStyled>
    </CustomModal>
  )
}

export default ConfirmDeleteUserRoleModal
