import { useEffect, useState } from 'react'
import { Button, Card, CardContent, Grid, Typography } from '@mui/material'

import toast from 'react-hot-toast'
import axios from 'axios'
import { useSlack } from 'src/hooks/useSlack'
import { NangoIntegration } from 'src/context/types'

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState<NangoIntegration[]>([])
  const { owner, connectSlack, isSlackConnected, disconnectSlack } = useSlack()

  const getIntegrations = async () => {
    try {
      const { data } = await axios.get('/api/nango/integrations')

      if (data.ok) {
        setIntegrations(data.integrations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getIntegrations()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h3' marginBottom={4}>
          Integrations
        </Typography>

        {integrations?.map(integration => (
          <Card key={integration.display_name}>
            <CardContent style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={integration.logo} width={35} height={35} alt={integration?.display_name} />
                <Typography variant='h4'>{integration?.display_name}</Typography>

                <Typography marginLeft={3}>{owner?.profile?.email}</Typography>
              </div>
              {isSlackConnected ? (
                <Button variant='outlined' color='error' onClick={disconnectSlack}>
                  Disconnect
                </Button>
              ) : (
                <Button variant='contained' onClick={connectSlack}>
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Grid>
    </Grid>
  )
}

export default IntegrationsPage
