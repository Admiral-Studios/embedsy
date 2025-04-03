import { useContext, useState } from 'react'
import { Button, Card, CardContent, Grid, Typography } from '@mui/material'

import { useSlack } from 'src/hooks/useSlack'
import { useAuth } from 'src/hooks/useAuth'
import SyncsSettingsModal from './_components/SyncsSettingsModal'
import { NangoContext } from 'src/context/NangoContext'
import AddNewIntegration from './_components/AddNewIntegration'

const IntegrationsPage = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<null | string>(null)

  const handleClickOpen = (value: string) => setSelectedIntegration(value)
  const handleClose = () => setSelectedIntegration(null)

  const { owner, connectSlack } = useSlack()
  const { connections, integrations } = useContext(NangoContext)
  const { hasAdminPrivileges } = useAuth()

  const connectionId = connections.find(
    ({ providerConfigKey }) => providerConfigKey === selectedIntegration
  )?.connectionId

  return (
    <>
      <Grid container>
        <Grid item container xs={12} spacing={4}>
          <Grid item xs={12}>
            <Typography variant='h3'>Integrations</Typography>
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <AddNewIntegration />
          </Grid>

          <Grid item xs={12} display='flex' gap={2} flexDirection='column'>
            {integrations?.map(integration => (
              <Card key={integration.display_name}>
                <CardContent
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src={integration.logo} width={35} height={35} alt={integration?.display_name} />
                    <Typography variant='h4'>{integration?.display_name}</Typography>

                    <Typography marginLeft={3}>{owner?.profile?.email}</Typography>
                  </div>
                  {hasAdminPrivileges && (
                    <Button
                      variant='contained'
                      onClick={() => handleClickOpen(integration.provider)}
                      sx={{ marginLeft: 'auto' }}
                    >
                      Syncs settings
                    </Button>
                  )}

                  <Button variant='contained' onClick={connectSlack}>
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <SyncsSettingsModal integration={selectedIntegration} handleClose={handleClose} connectionId={connectionId} />
    </>
  )
}

export default IntegrationsPage
