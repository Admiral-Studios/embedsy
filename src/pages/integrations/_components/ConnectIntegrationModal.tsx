import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, TextField } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNangoIntegration } from 'src/hooks/nango/useNangoIntegration'

interface Props {
  integrationToConnect: string | null
  onClose: () => void
}

interface NangoProviderItem {
  name: string
  display_name: string
  auth_mode: string
}

export const ConnectIntegrationModal = ({ integrationToConnect, onClose }: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [currentProvider, setCurrentProvider] = useState<NangoProviderItem | null>(null)
  const [clientId, setClientId] = useState<string>('')
  const [clientSecret, setClientSecret] = useState<string>('')
  const { connectIntegrationWithCredentials } = useNangoIntegration()

  const getProviders = async () => {
    setIsLoading(true)
    const { data } = await axios.get('/api/nango/providers')

    setCurrentProvider(data.providers.find((item: NangoProviderItem) => item.name === integrationToConnect))
    setIsLoading(false)
  }

  const oauth2Connect = async () => {
    setIsLoading(true)
    await connectIntegrationWithCredentials(integrationToConnect, {
      oauth_client_id_override: clientId,
      oauth_client_secret_override: clientSecret
    })
    setClientId('')
    setClientSecret('')
    setIsLoading(false)
    onClose()
  }

  useEffect(() => {
    getProviders()
  }, [integrationToConnect])

  return (
    <Dialog open={!!integrationToConnect} onClose={onClose} maxWidth={'md'} sx={{ overflow: 'hidden' }}>
      <DialogTitle id='alert-dialog-title'>Connect {currentProvider?.display_name}</DialogTitle>
      <DialogContent
        sx={{ gap: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '600px' }}
      >
        {isLoading ? (
          <CircularProgress sx={{ alignSelf: 'center', my: '50px' }} />
        ) : (
          <>
            <TextField
              sx={{ width: '100%' }}
              label='Client ID'
              value={clientId}
              onChange={e => setClientId(e.target.value)}
            />
            <TextField
              sx={{ width: '100%' }}
              label='Client Secret'
              value={clientSecret}
              onChange={e => setClientSecret(e.target.value)}
            />

            <Button onClick={oauth2Connect} variant='contained' color='primary'>
              Connect
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
