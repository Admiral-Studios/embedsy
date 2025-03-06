import React from 'react'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'

import RolesGrid from 'src/views/pages/configuration/components/RolesGrid/RolesGrid'
import UserRolesGrid from 'src/views/pages/configuration/components/UserRolesGrid/UserRolesGrid'
import RoleReportsGrid from 'src/views/pages/configuration/components/RoleReportsGrid/RoleReportsGrid'
import { RolesContextProvider } from 'src/context/RolesContext'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import { useAuth } from 'src/hooks/useAuth'

const Configuration = () => {
  const { canRefresh, hasAdminPrivileges } = useAuth()

  return (
    <RolesContextProvider>
      <Grid container spacing={6}>
        {hasAdminPrivileges && (
          <>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <RolesGrid />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <UserRolesGrid />
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        {(canRefresh || hasAdminPrivileges) && (
          <Grid item xs={12} md={12}>
            <Card>
              <CardContent>
                <RoleReportsGrid />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </RolesContextProvider>
  )
}

Configuration.acl = {
  action: 'read',
  subject: SubjectTypes.UserConfiguration
}

export default Configuration
