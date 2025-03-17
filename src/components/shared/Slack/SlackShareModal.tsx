import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material'
import { useState } from 'react'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useSlack } from 'src/hooks/useSlack'
import AutocompleteInput from '../AutocompleteInput'

type Props = {
  open: boolean
  onClose: () => void
}

const SlackShareModal = ({ open, onClose }: Props) => {
  const [activeContacts, setActiveContacts] = useState<string[]>([])
  const { users, channels } = useSlack()
  const contacts = [...users, ...channels]
  const options = contacts.map(contact => contact.name)

  const onChange = (values: string[]) => {
    setActiveContacts(values)
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
        />
      </DialogContent>

      <DialogActions>
        <Button color='error' onClick={onClose}>
          Close
        </Button>

        <Button variant='contained' color='primary'>
          Share
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SlackShareModal
