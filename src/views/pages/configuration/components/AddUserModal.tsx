import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import React, { useState } from 'react'
import CustomDialog from 'src/components/shared/CustomDialog'
import AutocompleteInput from 'src/components/shared/AutocompleteInput'
import { emailRegex } from 'src/utils/regex'
import { RoleWithUsersPagesType } from 'src/types/types'
import { Icon } from '@iconify/react'

type Props = {
  open: boolean
  onClose: () => void
  handleProcessed: (emails: string[]) => Promise<void>
  allUsersEmails: { email: string; role: string }[]
  roleToAssignUser: RoleWithUsersPagesType | null
}

const AddUserModal = ({ open, onClose, handleProcessed, allUsersEmails, roleToAssignUser }: Props) => {
  const [emails, setEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [overridingExistingRole, setOverridingExistingRole] = useState(false)

  const options = allUsersEmails.filter(user => !roleToAssignUser?.users.map(user => user.email)?.includes(user.email))

  const onProcessed = async () => {
    setLoading(true)
    try {
      await handleProcessed(emails)
      onClose()
      setEmails([])
      setOverridingExistingRole(false)
    } catch (error) {
      console.error('Error processing users:', error)
    } finally {
      setLoading(false)
    }
  }

  const onChange = (values: string[]) => {
    if (values.some(v => !emailRegex.test(v))) {
      setError('Please enter a valid email')

      return
    }

    setError('')
    setEmails(values)

    const hasExistingUser = values.some(email =>
      options.some(user => user.email === email || user.email === getOptionValue(email))
    )
    setOverridingExistingRole(hasExistingUser)
  }

  const getOptionValue = (option: string) => {
    if (option.includes(' | Role:')) {
      return option.split(' | Role:')[0].trim()
    }

    return option
  }

  return (
    <CustomDialog open={open} handleClose={onClose} fullWidth maxWidth='md'>
      <DialogContent>
        <Typography variant='h3' sx={{ fontSize: '18px', pt: 2, lineHeight: '22px' }}>
          Add user
        </Typography>

        <Box sx={{ mt: 4 }}>
          <AutocompleteInput
            multiple
            options={options.map(user => `${user.email} | Role: ${user.role}`)}
            freeSolo
            placeholder='Add user emails. Press "Enter" after each email.'
            value={emails}
            onChange={onChange}
            error={error}
            getOptionValue={getOptionValue}
          />
        </Box>

        {emails.length > 0 && overridingExistingRole && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, color: 'text.secondary' }}>
            <Icon icon='mdi:alert-circle-outline' fontSize={20} style={{ marginRight: '8px' }} />
            <Typography variant='body2'>
              Warning: The current role of the selected users is going to be replaced by the new role:{' '}
              <b>{roleToAssignUser?.role}</b>
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant='outlined' disabled={loading || !emails.length} onClick={onProcessed}>
          Add
        </Button>
      </DialogActions>
    </CustomDialog>
  )
}

export default AddUserModal
