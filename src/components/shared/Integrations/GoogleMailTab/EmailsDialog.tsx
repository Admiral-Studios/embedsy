import { Button, Checkbox, Dialog, DialogActions, DialogContent, FormControlLabel } from '@mui/material'
import React, { ChangeEvent, useState } from 'react'

type Props = {
  emailsData: string[]
  handleClose: () => void
  addToRecipients: (email: string[]) => void
}

const EmailsDialog = (props: Props) => {
  const { emailsData, handleClose, addToRecipients } = props

  const [selectedEmails, setSelectedEmails] = useState(emailsData)

  const handleChange = (e: ChangeEvent<HTMLInputElement>, email: string) => {
    if (!e.target.checked) {
      setSelectedEmails(selectedEmails.filter(curEmail => curEmail !== email))

      return
    }

    setSelectedEmails([...selectedEmails, email])
  }

  const handleUse = () => {
    addToRecipients(selectedEmails)
    handleClose()
  }

  return (
    <Dialog open onClose={handleClose}>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '324px', overflowY: 'auto' }}>
        {emailsData.map(email => (
          <FormControlLabel
            key={email}
            label={email}
            control={
              <Checkbox
                checked={selectedEmails.includes(email)}
                onChange={e => handleChange(e, email)}
                sx={{ svg: { width: '32px', height: '32px' } }}
              />
            }
          />
        ))}
      </DialogContent>

      <DialogActions>
        <Button color='error' onClick={handleClose}>
          Close
        </Button>

        <Button variant='contained' color='primary' onClick={handleUse}>
          Use
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EmailsDialog
