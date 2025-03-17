import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useContext, useState } from 'react'
import { useSlack } from 'src/hooks/useSlack'
import AutocompleteInput from '../AutocompleteInput'
import { SlackShareModalOption } from './SlackShareModalOption'
import axios from 'axios'
import { NangoContext } from 'src/context/NangoContext'

type Props = {
  open: boolean
  onClose: () => void
}

const SlackShareModal = ({ open, onClose }: Props) => {
  const { connectionId } = useContext(NangoContext)

  //   const [loading, setLoading] = useState(false)
  const [activeContacts, setActiveContacts] = useState<string[]>([])
  const { users, channels } = useSlack()
  const contacts = [...users, ...channels]
  const options = contacts.map(contact => contact.name)

  const onChange = (values: string[]) => {
    setActiveContacts(values)
  }

  console.log(users)

  const shareData = async () => {
    // setLoading(true)

    try {
      const resp = await axios.post('/api/nango/slack/send_message', {
        connectionId,
        channel: 'C08GRTP2HU4',
        text: 'Hello from Nango'
      })

      console.log(resp)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Share on Slack</DialogTitle>

      <DialogContent>
        <AutocompleteInput
          multiple
          freeSolo
          options={options}
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
