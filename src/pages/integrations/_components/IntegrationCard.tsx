import { Button, Card, CardContent, Typography } from '@mui/material'
import axios from 'axios'
import { useContext, useEffect } from 'react'
import { NangoContext } from 'src/context/NangoContext'
import { NangoIntegration } from 'src/context/types'
import { useNangoIntegration } from 'src/hooks/nango/useNangoIntegration'

import { useAuth } from 'src/hooks/useAuth'

interface Props {
  integration: NangoIntegration
  openSyncsSettings: (provider: string) => void
}

const IntegrationCard = ({ integration, openSyncsSettings }: Props) => {
  const { hasAdminPrivileges } = useAuth()
  const { connections } = useContext(NangoContext)
  const { connectIntegration, disconnectIntegration } = useNangoIntegration()

  const isConnected = connections.find(connection => connection.providerConfigKey === integration.provider)

  const getScripts = async () => {
    try {
      const scripts = await axios.get('api/nango/scripts')
      console.log(scripts)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getScripts()
  }, [])

  return (
    <Card key={integration.display_name}>
      <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src={integration.logo} width={35} height={35} alt={integration?.display_name} />
          <Typography variant='h4'>{integration?.display_name}</Typography>

          {/* <Typography marginLeft={3}>{owner?.profile?.email}</Typography> */}
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
          <Button variant='outlined' onClick={() => disconnectIntegration(integration.provider)}>
            Disconnect
          </Button>
        ) : (
          <Button variant='contained' onClick={() => connectIntegration(integration.provider)}>
            Connect
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default IntegrationCard
