import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import React, { useState } from 'react'
import CustomDialog from 'src/components/shared/CustomDialog'
import AutocompleteInput from 'src/components/shared/AutocompleteInput'
import { emailRegex } from 'src/utils/regex'
import { RoleWithUsersPagesType } from 'src/types/types'

type Props = {
  open: boolean
  onClose: () => void
  handleProcessed: (emails: string[]) => Promise<void>
  allUsersEmails: string[]
  roleToAssignUser: RoleWithUsersPagesType | null
}

const AddUserModal = ({ open, onClose, handleProcessed, allUsersEmails, roleToAssignUser }: Props) => {
  const [emails, setEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const options = allUsersEmails.filter(user => !roleToAssignUser?.users.map(user => user.email)?.includes(user))

  const onProcessed = async () => {
    setLoading(true)

    await handleProcessed(emails)

    onClose()
    setEmails([])

    setLoading(false)
  }

  const onChange = (values: string[]) => {
    if (values.some(v => !emailRegex.test(v))) {
      setError('Please enter a valid email')

      return
    }

    setError('')
    setEmails(values)
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
            options={options}
            freeSolo
            placeholder='Add user emails. Press "Enter" after each email.'
            value={emails}
            onChange={onChange}
            error={error}
          />
        </Box>
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
