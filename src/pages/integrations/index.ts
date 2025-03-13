import React from 'react'
import { Grid, Card, CardContent, Typography } from '@mui/material'

const IntegrationsPage = () => {
  return (
    <Grid spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant='h5'>Integrations</Typography>
            <Typography variant='body2'>Manage your integrations here.</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default IntegrationsPage
