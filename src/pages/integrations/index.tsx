import { useContext, useState } from 'react'
import { Grid, Typography } from '@mui/material'

import SyncsSettingsModal from './_components/SyncsSettingsModal'
import { NangoContext } from 'src/context/NangoContext'
import AddNewIntegration from './_components/AddNewIntegration'
import IntegrationCard from './_components/IntegrationCard'

const IntegrationsPage = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<null | string>(null)

  const handleClickOpen = (value: string) => setSelectedIntegration(value)
  const handleClose = () => setSelectedIntegration(null)

  const { connections, integrations } = useContext(NangoContext)

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
              <IntegrationCard
                key={integration.provider}
                integration={integration}
                openSyncsSettings={handleClickOpen}
              />
            ))}
          </Grid>
        </Grid>
      </Grid>

      <SyncsSettingsModal integration={selectedIntegration} handleClose={handleClose} connectionId={connectionId} />
    </>
  )
}

export default IntegrationsPage
