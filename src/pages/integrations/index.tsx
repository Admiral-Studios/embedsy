import React, { useEffect, useRef } from 'react'
import Grid from '@mui/material/Grid'

import Nango from '@nangohq/frontend'
import type { ConnectUI } from '@nangohq/frontend'

import { RolesContextProvider } from 'src/context/RolesContext'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import { useAuth } from 'src/hooks/useAuth'
import axios from 'axios'

const Integrations = () => {
  const { hasAdminPrivileges } = useAuth()
  const connectUI = useRef<ConnectUI>()
  const nango = new Nango()

  connectUI.current = nango.openConnectUI({
    onEvent: event => {
      if (event.type === 'close') {
        // Handle modal closed.
      } else if (event.type === 'connect') {
        // Handle auth flow successful.
      }
    }
  })

  const fetchNangoSessionToken = async () => {
    try {
      const response = await axios.post('/api/nango/session_token', {})

      console.log(response.data)
      connectUI.current!.setSessionToken(response.data)
    } catch (error) {}
  }

  useEffect(() => {
    fetchNangoSessionToken()
  }, [fetchNangoSessionToken])

  return (
    // connectUI.current
    <RolesContextProvider>
      <Grid container spacing={6}>
        {hasAdminPrivileges && <div></div>}
      </Grid>
    </RolesContextProvider>
  )
}

Integrations.acl = {
  action: 'read',
  subject: SubjectTypes.Integrations
}

export default Integrations
