import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import React, { useState } from 'react'
import CustomDialog from 'src/components/shared/CustomDialog'
import AutocompleteInput from 'src/components/shared/AutocompleteInput'
import { emailRegex } from 'src/utils/regex'

type Props = {
  open: boolean
  onClose: () => void
  handleProcessed: (emails: string[]) => Promise<void>
  allUsersEmails: string[]
}

const AddUserModal = ({ open, onClose, handleProcessed, allUsersEmails }: Props) => {
  const [emails, setEmails] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onProcessed = async () => {
    setLoading(true)

    await handleProcessed(emails)

    onClose()
    setEmails([])

    setLoading(false)
  }

  const onChange = (values: string[]) => {
    const emailAlreadyExist = values.some(email => allUsersEmails.includes(email))

    if (emailAlreadyExist) {
      setError('User with this email is already exist')

      return
    }

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
