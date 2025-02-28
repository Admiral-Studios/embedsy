import { Button, DialogActions, DialogContent, MenuItem, Typography } from '@mui/material'
import React, { useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomDialog from 'src/components/shared/CustomDialog'
import { RoleType } from 'src/types/types'

type Props = {
  open: boolean
  onClose: () => void
  roles: RoleType[]
  handleProcessed: (newRole: RoleType) => Promise<void>
}

const AddExistingRoleModal = ({ open, onClose, roles, handleProcessed }: Props) => {
  const [role, setRole] = useState<RoleType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const onProcessed = async () => {
    if (role) {
      setIsLoading(true)

      await handleProcessed(role)

      onClose()
      setRole(null)

      setIsLoading(false)
    }
  }

  return (
    <CustomDialog open={open} handleClose={onClose} fullWidth maxWidth='sm'>
      <DialogContent>
        <Typography variant='h3' sx={{ fontSize: '18px', pt: 2, lineHeight: '22px' }}>
          Add role
        </Typography>

        <CustomTextField
          label='Select Role'
          variant='outlined'
          size='small'
          select
          fullWidth
          value={role?.id || ''}
          sx={{
            mt: 4,
            '.MuiInputBase-root .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',

              '.MuiBox-root': {
                mr: 4
              }
            }
          }}
          SelectProps={{
            onChange: (e: any) => {
              const foundedRole = roles.find(({ id }) => id === e.target.value)

              if (foundedRole) setRole(foundedRole)
            }
          }}
        >
          {roles.map(v => (
            <MenuItem
              key={v.id}
              value={v.id}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              {v.role}
            </MenuItem>
          ))}
        </CustomTextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant='outlined' disabled={isLoading || !role} onClick={onProcessed}>
          Add
        </Button>
      </DialogActions>
    </CustomDialog>
  )
}

export default AddExistingRoleModal
