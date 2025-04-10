import { Box } from '@mui/material'
import { useState } from 'react'

// import toast from 'react-hot-toast'
import AutocompleteInput from '../../AutocompleteInput'
import SlackShareModalOption from './SlackAutoCompleteOption'
import { useSlack } from 'src/hooks/useSlack'

const SlackTab = () => {
  const [activeContacts, setActiveContacts] = useState<string[]>([])
  const { users, channels } = useSlack()
  const contacts = [...users, ...channels]

  const onChange = (values: string[]) => {
    setActiveContacts(values)
  }

  // const shareData = async () => {
  //   try {
  //     const requests = activeContacts.map(channel =>
  //       sendMessage(contacts.find(contact => contact.name === channel)?.id || '', sharedData || 'Nango test message')
  //     )

  //     const responses = await Promise.all(requests)

  //     if (responses.length === 1) {
  //       return toast.success('Message sent successfully')
  //     } else {
  //       return toast.success('Messages sent successfully')
  //     }
  //   } catch (e) {
  //     console.error(e)
  //     toast.error('Failed to share data')
  //   } finally {
  //     setActiveContacts([])
  //   }
  // }

  return (
    <Box sx={{ p: 5 }}>
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
    </Box>
  )
}

export default SlackTab
