import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useSlack } from 'src/hooks/useSlack'
import AutocompleteInput from '../AutocompleteInput'
import { SlackShareModalOption } from './SlackShareModalOption'
import toast from 'react-hot-toast'
import { NangoSyncConfig, NangoSyncModel, StandardNangoConfig } from '@nangohq/node'
import axios from 'axios'
import CustomTextField from 'src/@core/components/mui/text-field'
import { NangoContext } from 'src/context/NangoContext'

type Props = {
  open: boolean
  onClose: () => void
  sharedData: null | string
}

const ShareDataModal = ({ open, onClose, sharedData }: Props) => {
  // const [activeContacts, setActiveContacts] = useState<string[]>([])

  // const { users, channels, sendMessage } = useSlack()
  // const contacts = [...users, ...channels]

  const { connections } = useContext(NangoContext)

  const [scripts, setScripts] = useState<StandardNangoConfig[]>([])

  const [selectedScript, setSelectedScript] = useState<NangoSyncConfig | null>(null)
  const [selectedProvider, setSelectedProvider] = useState('')

  const [body, setBody] = useState<{ [key: string]: string }>({})

  // const onChange = (values: string[]) => {
  //   setActiveContacts(values)
  // }

  const shareData = async () => {
    try {
      const connectionId = connections.find(c => c.providerConfigKey === selectedProvider)?.connectionId

      if (!connectionId) {
        throw new Error('Failed to find connection')
      }

      const res = await axios.post('/api/nango/share_data', {
        connectionId,
        provider: selectedProvider,
        body,
        actionName: selectedScript?.name
      })

      console.log(res)
    } catch (e) {
      console.error(e)
      toast.error('Failed to share data')
    } finally {
      onClose()
      setBody({})
      setSelectedProvider('')
      setSelectedScript(null)
    }
  }

  const getScripts = async () => {
    try {
      const res = await axios.get('/api/nango/integrations/scripts')

      setScripts(res.data.scriptsConfig)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (open) {
      getScripts()
    }
  }, [open])

  console.log(scripts)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Share to Slack</DialogTitle>

      <DialogContent>
        <Box
          sx={{
            maxHeight: '200px',
            overflowY: 'auto'
          }}
        >
          {sharedData}
        </Box>

        {/* <AutocompleteInput
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
        /> */}

        {scripts.map(script => (
          <Box key={script.providerConfigKey} sx={{ py: 4 }}>
            <Typography color='primary'>{script.provider}</Typography>

            {script.actions
              .filter(action => action.endpoints[0].method === 'POST')
              .map(action => (
                <Box key={action.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Box>
                      {action.name} | {action.endpoints[0].method}
                    </Box>
                    <Box>{action.description}</Box>
                  </Box>

                  <Button
                    onClick={() => {
                      setSelectedScript(action)
                      setSelectedProvider(script.providerConfigKey)
                    }}
                  >
                    Use
                  </Button>
                </Box>
              ))}
          </Box>
        ))}

        {selectedScript && (
          <Box>
            <Typography>{selectedScript.input?.name}</Typography>

            <Typography>{selectedScript.input?.description}</Typography>

            {selectedScript.input?.fields.map(field => (
              <CustomTextField
                key={field.name}
                fullWidth
                label={field.name}
                placeholder={field.name}
                value={body[field.name]}
                onChange={e => setBody({ ...body, [field.name]: e.target.value })}
                sx={{ py: 2 }}
              />
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button color='error' onClick={onClose}>
          Close
        </Button>

        <Button variant='contained' color='primary' onClick={shareData} disabled={!selectedProvider || !selectedScript}>
          Share
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ShareDataModal

// What need To Do
// 1. the ability to display fields for the body of the request adaptively.
// For example, if the field type is an array of strings, then add the text "Write values ​​separated by commas" to the placeholder.
//
// 2. each field has an "optional" value. I suggest that when you click on the button,
// validate the values ​​using this field and also by the presence of this value in the state of the body
//
// 3.to filter the desired POST endpoints, add an array with key phrases and words, for example [send, send message, send data, ...etc].
// Then filter these endpoints by the array of key phrases and the description for the endpoint
//
// 4.T o send a message to slack we need to get the channel ID using another endpoint, we also need to process this
