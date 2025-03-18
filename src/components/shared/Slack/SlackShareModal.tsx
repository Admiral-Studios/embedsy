import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useState } from 'react'
import { useSlack } from 'src/hooks/useSlack'
import AutocompleteInput from '../AutocompleteInput'
import { SlackShareModalOption } from './SlackShareModalOption'
import toast from 'react-hot-toast'

type Props = {
  open: boolean
  onClose: () => void
}

const SlackShareModal = ({ open, onClose }: Props) => {
  const [activeContacts, setActiveContacts] = useState<string[]>([])
  const { users, channels, sendMessage } = useSlack()
  const contacts = [...users, ...channels]

  const onChange = (values: string[]) => {
    setActiveContacts(values)
  }

  const shareData = async () => {
    try {
      const requests = activeContacts.map(channel =>
        sendMessage(contacts.find(contact => contact.name === channel)?.id || '', 'Nango test message')
      )

      const responses = await Promise.all(requests)

      if (responses.length === 1) {
        return toast.success('Message sent successfully')
      } else {
        return toast.success('Messages sent successfully')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to share data')
    } finally {
      setActiveContacts([])
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Share to Slack</DialogTitle>

      <DialogContent>
        <AutocompleteInput
          multiple
          freeSolo
          options={contacts.map(contact => contact.name)}
          placeholder='Add contacts to share data. Press "Enter" after each email.'
          onChange={onChange}
          value={activeContacts}
          getOptionLabel={option => option}
          renderOption={option => {
            return (
              <SlackShareModalOption
                key={option.key}
                option={option}
                contact={contacts.find(contact => contact.name === option.key) || null}
              />
            )
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button color='error' onClick={onClose}>
          Close
        </Button>

        <Button onClick={shareData} variant='contained' color='primary'>
          Share
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SlackShareModal
