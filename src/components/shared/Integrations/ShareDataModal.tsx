import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { StandardNangoConfig } from '@nangohq/node'
import axios from 'axios'
import { DataGrid, GridColumnVisibilityModel } from '@mui/x-data-grid'
import GoogleMailTab from './GoogleMailTab/GoogleMailTab'
import SlackTab from './SlackTab/SlackTab'
import { csvToDataGrid } from 'src/utils/csvToDataGrid'

type Props = {
  open: boolean
  onClose: () => void
  sharedData: null | string
}

const ShareDataModal = ({ open, onClose, sharedData }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [scripts, setScripts] = useState<StandardNangoConfig[]>([])
  const [selectedTab, setSelectedTab] = useState('slack')

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({})

  const { columns, rows } = useMemo(() => csvToDataGrid(sharedData), [sharedData])

  console.log(columns, rows)

  const getScripts = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get('/api/nango/integrations/scripts')

      setScripts(res.data.scriptsConfig)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue)
  }

  useEffect(() => {
    if (open) {
      getScripts()
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xl' fullWidth>
      <DialogTitle>Share Data</DialogTitle>

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '600px'
          }}
        >
          <CircularProgress sx={{ color: '#FFC815' }} />
        </Box>
      ) : (
        <>
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
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={newModel => setColumnVisibilityModel(newModel)}
              />
            </Box>

            <Tabs value={selectedTab} onChange={handleTabChange} sx={{ backgroundColor: 'white' }}>
              {scripts.map(script => (
                <Tab
                  key={script.provider}
                  label={script.provider ? script.provider.charAt(0).toUpperCase() + script.provider.slice(1) : ''}
                  value={script.provider}
                  sx={{
                    '&.Mui-selected': {
                      color: '#FFC815 !important'
                    }
                  }}
                />
              ))}
            </Tabs>
          </DialogContent>

          <Box sx={{ px: 11, pb: 6 }}>
            {selectedTab === 'slack' && (
              <SlackTab
                setIsLoading={setIsLoading}
                onClose={onClose}
                sharedData={sharedData}
                columnVisibility={columnVisibilityModel}
              />
            )}

            {selectedTab === 'google-mail' && (
              <GoogleMailTab
                setIsLoading={setIsLoading}
                onClose={onClose}
                sharedData={sharedData}
                rows={rows}
                columnVisibility={columnVisibilityModel}
              />
            )}
          </Box>
        </>
      )}
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
