import { Box, Button, DialogActions } from '@mui/material'
import { useState } from 'react'

import toast from 'react-hot-toast'
import AutocompleteInput from '../../AutocompleteInput'
import { SlackAutocompleteOption } from './SlackAutoCompleteOption'
import { useSlack } from 'src/hooks/useSlack'

import { csvToMarkdown } from 'src/utils/csvToMarkdown'

interface SlackTabProps {
  onClose: () => void
  sharedData: string | null
  setIsLoading: (isLoading: boolean) => void
}

const SlackTab = ({ onClose, sharedData, setIsLoading }: SlackTabProps) => {
  const [activeContacts, setActiveContacts] = useState<string[]>([])
  const { users, channels, sendMessage } = useSlack()
  const contacts = [...users, ...channels]
  const messageChunks = csvToMarkdown(sharedData)

  const onChange = (values: string[]) => {
    setActiveContacts(values)
  }

  const shareData = async () => {
    setIsLoading(true)
    try {
      const requests = activeContacts.map(async channel => {
        const contactId = contacts.find(contact => contact.name === channel)?.id || ''

        for (const message of messageChunks) {
          await sendMessage(contactId, message || 'Nango test message')
        }
      })

      const responses = await Promise.all(requests.flat())

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
      setIsLoading(false)
    }
  }

  return (
    <>
      <Box sx={{ px: 11, pb: 6 }}>
        <AutocompleteInput
          multiple
          freeSolo
          label='Channels to share data'
          options={contacts.map(contact => contact.name)}
          placeholder='Add channels to share data. Press "Enter" after each channel.'
          onChange={onChange}
          value={activeContacts}
          getOptionLabel={option => option}
          renderOption={option => {
            return (
              <SlackAutocompleteOption
                key={option.key}
                option={option}
                contact={contacts.find(contact => contact.name === option.key) || null}
              />
            )
          }}
        />
      </Box>
      <DialogActions>
        <Button color='error' onClick={onClose}>
          Close
        </Button>

        <Button variant='contained' color='primary' onClick={shareData}>
          Share
        </Button>
      </DialogActions>
    </>
  )
}

export default SlackTab
