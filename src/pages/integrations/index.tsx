import { useState, useRef } from 'react'
import Grid from '@mui/material/Grid'

import Nango from '@nangohq/frontend'
import type { ConnectUI } from '@nangohq/frontend'

import { RolesContextProvider } from 'src/context/RolesContext'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import { useAuth } from 'src/hooks/useAuth'
import axios from 'axios'
import { Button, Card, CardContent } from '@mui/material'
import toast from 'react-hot-toast'

const Integrations = () => {
  const [isMicrosoftTeamsConnected, setIsMicrosoftTeamsConnected] = useState(false)
  const { hasAdminPrivileges } = useAuth()
  const connectUI = useRef<ConnectUI>()
  const nango = new Nango()

  const fetchNangoSessionToken = async () => {
    try {
      const response = await axios.post('/api/nango/session_token', {})

      connectUI.current!.setSessionToken(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const getUnits = async () => {
    try {
      const resp = await axios.get('/api/nango/get_units')

      console.log(resp.data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleAddMicrosoftTeams = () => {
    fetchNangoSessionToken()

    connectUI.current = nango.openConnectUI({
      onEvent: event => {
        if (event.type === 'connect') {
          toast.success('Connected to Microsoft Teams')
          setIsMicrosoftTeamsConnected(true)
          getUnits()
        }
      }
    })
  }

  return (
    <RolesContextProvider>
      <Grid container item spacing={6}>
        {hasAdminPrivileges && <div></div>}

        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: '5px 0' }}>Microsoft Teams</h3>

              {isMicrosoftTeamsConnected ? (
                <Button>Connected</Button>
              ) : (
                <Button variant='contained' onClick={handleAddMicrosoftTeams}>
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </RolesContextProvider>
  )
}

Integrations.acl = {
  action: 'read',
  subject: SubjectTypes.Integrations
}

export default Integrations
