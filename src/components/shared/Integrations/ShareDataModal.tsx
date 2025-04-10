import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { NangoSyncConfig, StandardNangoConfig } from '@nangohq/node'
import axios from 'axios'
import { NangoContext } from 'src/context/NangoContext'
import { csvToDataGrid } from 'src/utils/csvToDataGrid'
import { DataGrid } from '@mui/x-data-grid'
import SlackTab from './SlackTab/SlackTab'
import GoogleMailTab from './GoogleMailTab/GoogleMailTab'

type Props = {
  open: boolean
  onClose: () => void
  sharedData: null | string
}

const ShareDataModal = ({ open, onClose, sharedData }: Props) => {
  const { connections } = useContext(NangoContext)
  const [scripts, setScripts] = useState<StandardNangoConfig[]>([])
  const [selectedTab, setSelectedTab] = useState(0)

  const [selectedScript, setSelectedScript] = useState<NangoSyncConfig | null>(null)
  const [selectedProvider, setSelectedProvider] = useState('')

  const [body, setBody] = useState<{ [key: string]: string }>({})
  const { columns, rows } = csvToDataGrid(sharedData)

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  useEffect(() => {
    if (open) {
      getScripts()
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xl' fullWidth>
      <DialogTitle>Share to Slack</DialogTitle>

      <DialogContent>
        <Box
          sx={{
            overflowY: 'auto'
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            editMode='row'
            getRowHeight={() => null}
            sx={() => ({
              height: 500
            })}
          />
        </Box>

        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ backgroundColor: 'white' }}>
          {scripts.map(script => (
            <Tab
              key={script.provider}
              label={script.provider ? script.provider.charAt(0).toUpperCase() + script.provider.slice(1) : ''}
              value={String(scripts.indexOf(script))}
              sx={{
                '&.Mui-selected': {
                  color: '#FFC815 !important'
                }
              }}
            />
          ))}
        </Tabs>

        {Number(selectedTab) === 0 && <SlackTab />}

        {Number(selectedTab) === 1 && <GoogleMailTab />}
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
