import React from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'

import { RolesBrandingContextProvider } from 'src/context/RolesBrandingContext'
import RoleBrandingGrid from 'src/views/pages/roles-configuration/components/RoleBrandingGrid/RoleBrandingGrid'

const RolesConfiguration = () => {
  return (
    <RolesBrandingContextProvider>
      <Grid container spacing={6} sx={{ height: '100%' }}>
        <Grid item xs={12} md={12}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%' }}>
              <RoleBrandingGrid />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </RolesBrandingContextProvider>
  )
}

export default RolesConfiguration
