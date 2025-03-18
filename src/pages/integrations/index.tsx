import React, { useContext } from 'react'
import { Button, Card, CardContent, Grid, Typography } from '@mui/material'
import { NangoContext } from 'src/context/NangoContext'
import Nango from '@nangohq/frontend'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useSlack } from 'src/hooks/useSlack'

const IntegrationsPage = () => {
  const { sessionToken, integrations, providerConfigKey, connectionId, setProviderConfigKey, setConnectionId } =
    useContext(NangoContext)
  const { owner } = useSlack()
  const nango = new Nango({ connectSessionToken: sessionToken })

  const connectSlack = async () => {
    nango.openConnectUI({
      sessionToken,
      onEvent: event => {
        if (event.type === 'connect') {
          Cookies.set('connectionId', event.payload.connectionId, { path: '/', sameSite: 'Strict' })
          setConnectionId(event.payload.connectionId)
          Cookies.set('providerConfigKey', event.payload.providerConfigKey, { path: '/', sameSite: 'Strict' })
          setProviderConfigKey(event.payload.providerConfigKey)
          toast.success('Slack connected successfully')
        }
      }
    })
  }

  const disconnectSlack = async () => {
    const resp = await axios.post('/api/nango/delete_connection', {
      integrationId: providerConfigKey,
      connectionId
    })

    if (resp.data.ok) {
      Cookies.remove('connectionId')
      Cookies.remove('providerConfigKey')
      setConnectionId('')
      setProviderConfigKey('')

      return toast.success(resp.data.message)
    }

    return toast.error(resp.data.message)
  }

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
              {owner?.id ? (
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
