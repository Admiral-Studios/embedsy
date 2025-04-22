import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomTextField from 'src/@core/components/mui/text-field'
import { NangoContext } from 'src/context/NangoContext'

const INIT_OAUTH_FIELD = { oauth_client_id: '', oauth_client_secret: '', oauth_scopes: '' }

const AddNewIntegration = () => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [value, setValue] = useState<{ display_name: string; name: string; auth_mode: string } | null>(null)
  const [providers, setProviders] = useState([])

  const [oauth, setOauth] = useState(INIT_OAUTH_FIELD)

  const { getIntegrations } = useContext(NangoContext)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleAdd = async () => {
    try {
      await axios.post('/api/nango/providers/add', {
        provider: value?.name,
        providerConfigKey: value?.name,
        oauth: value?.auth_mode === 'OAUTH2' ? oauth : ''
      })

      setValue(null)
      setInputValue('')
      setOauth(INIT_OAUTH_FIELD)
      handleClose()
      await getIntegrations()
    } catch (error) {
      toast.error('Failed to add integration')
    }
  }

  const handleInputChange = async (_: any, newInputValue: string, reason: string) => {
    setInputValue(newInputValue)

    if (reason === 'clear') {
      setValue(null)
      setInputValue('')
    }
  }

  useEffect(() => {
    if (open) {
      axios(`/api/nango/providers`).then(response => setProviders(response.data?.providers))
    }
  }, [open])

  return (
    <>
      <Button variant='contained' onClick={handleOpen}>
        Add integration
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth={'md'} sx={{ overflow: 'hidden' }}>
        <DialogTitle id='alert-dialog-title'>Add new integration</DialogTitle>

        <DialogContent sx={{ gap: '10px', display: 'flex', flexDirection: 'column', minWidth: '800px' }}>
          <Autocomplete
            options={providers}
            inputValue={inputValue}
            value={value}
            freeSolo
            onInputChange={handleInputChange}
            onChange={(_, newValue: any) => {
              if (value?.auth_mode === 'OAUTH2') {
                setOauth(INIT_OAUTH_FIELD)
              }

              setValue(newValue)
            }}
            getOptionLabel={(option: any) => option?.display_name}
            renderInput={params => (
              <CustomTextField
                {...params}
                variant='outlined'
                label={'Type to search integration'}
                placeholder=''
                sx={{
                  '.MuiFormLabel-root': {
                    overflow: 'visible'
                  }
                }}
              />
            )}
          />

          {value?.auth_mode === 'OAUTH2' && (
            <>
              <CustomTextField
                value={oauth.oauth_client_id}
                label='The ID of your OAuth app'
                fullWidth
                onChange={e => setOauth({ ...oauth, oauth_client_id: e.target.value })}
              />

              <CustomTextField
                value={oauth.oauth_client_secret}
                label='The secret of your OAuth app'
                fullWidth
                onChange={e => setOauth({ ...oauth, oauth_client_secret: e.target.value })}
              />

              <CustomTextField
                value={oauth.oauth_scopes}
                label='Comma separated list of scopes'
                fullWidth
                onChange={e => setOauth({ ...oauth, oauth_scopes: e.target.value })}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button
            onClick={handleAdd}
            autoFocus
            disabled={value?.auth_mode === 'OAUTH2' ? !oauth.oauth_client_id || !oauth.oauth_client_secret : false}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddNewIntegration
