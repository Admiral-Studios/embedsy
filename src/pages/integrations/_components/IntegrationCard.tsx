import { Button, Card, CardContent, CircularProgress, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { NangoContext } from 'src/context/NangoContext'
import { NangoIntegration } from 'src/context/types'
import { useNangoIntegration } from 'src/hooks/nango/useNangoIntegration'
import { useAuth } from 'src/hooks/useAuth'
import { ConnectIntegrationModal } from './ConnectIntegrationModal'

interface Props {
  integration: NangoIntegration
  openSyncsSettings: (provider: string) => void
}

const IntegrationCard = ({ integration, openSyncsSettings }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [integrationToConnect, setIntegrationToConnect] = useState<string | null>(null)

  const { hasAdminPrivileges } = useAuth()
  const { connections } = useContext(NangoContext)
  const { disconnectIntegration } = useNangoIntegration()

  const closeConnectModal = () => {
    setIntegrationToConnect(null)
  }

  const disconnect = async (provider: string) => {
    setIsLoading(true)
    await disconnectIntegration(provider)
    setIsLoading(false)
  }

  const isConnected = connections.find(connection => connection.providerConfigKey === integration.provider)

  return (
    <Card key={integration.display_name}>
      <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src={integration.logo} width={35} height={35} alt={integration?.display_name} />
          <Typography variant='h4'>{integration?.display_name}</Typography>
        </div>
        {hasAdminPrivileges && (
          <Button
            variant='contained'
            onClick={() => openSyncsSettings(integration.provider)}
            sx={{ marginLeft: 'auto' }}
          >
            Syncs settings
          </Button>
        )}

        {isConnected ? (
          <Button variant='outlined' onClick={() => disconnect(integration.provider)} disabled={isLoading}>
            {isLoading ? <CircularProgress size={20} /> : 'Disconnect'}
          </Button>
        ) : (
          <Button variant='contained' onClick={() => setIntegrationToConnect(integration.provider)}>
            Connect
          </Button>
        )}
      </CardContent>

      <ConnectIntegrationModal integrationToConnect={integrationToConnect} onClose={closeConnectModal} />
    </Card>
  )
}

export default IntegrationCard
