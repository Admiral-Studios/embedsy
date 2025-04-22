import { Box, Button, DialogActions } from '@mui/material'
import { useState } from 'react'

import toast from 'react-hot-toast'
import AutocompleteInput from '../../AutocompleteInput'

import { useSlack } from 'src/hooks/useSlack'

import { SlackAutocompleteOption } from './SlackAutocompleteOption'
import { csvToMarkdown } from 'src/utils/csvToMarkdown'
import { GridColumnVisibilityModel } from '@mui/x-data-grid'

interface SlackTabProps {
  onClose: () => void
  sharedData: string | null
  setIsLoading: (isLoading: boolean) => void
  columnVisibility: GridColumnVisibilityModel
}

const SlackTab = ({ onClose, sharedData, setIsLoading, columnVisibility }: SlackTabProps) => {
  const [activeContacts, setActiveContacts] = useState<string[]>([])
  const { users, channels, sendMessage } = useSlack()
  const contacts = [...users, ...channels]

  const onChange = (values: string[]) => {
    setActiveContacts(values)
  }

  const shareData = async () => {
    setIsLoading(true)

    const messageChunks = csvToMarkdown(sharedData, 3500, columnVisibility)

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
      <Box>
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

        <Button variant='contained' color='primary' onClick={shareData} disabled={!activeContacts.length}>
          Share
        </Button>
      </DialogActions>
    </>
  )
}

export default SlackTab
