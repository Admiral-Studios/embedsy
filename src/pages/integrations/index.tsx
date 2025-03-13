import { useContext, useState } from 'react'
import Grid from '@mui/material/Grid'

import Nango from '@nangohq/frontend'

import { RolesContextProvider } from 'src/context/RolesContext'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import { Button, Card, CardContent } from '@mui/material'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import SendMessageModal from './_components/SendMessageModal'
import { NangoContext } from 'src/context/NangoContext'

const Integrations = () => {
  const { sessionToken, providerConfigKey } = useContext(NangoContext)
  const [isMessageModal, setIsMessageModal] = useState(false)
  const nango = new Nango({ connectSessionToken: sessionToken })
  const isSlackConnected = providerConfigKey === 'slack'

  const handleAddSlack = async () => {
    nango.openConnectUI({
      sessionToken,
      onEvent: event => {
        if (event.type === 'connect') {
          Cookies.set('connectionId', event.payload.connectionId, { path: '/', sameSite: 'Strict' })
          Cookies.set('providerConfigKey', event.payload.providerConfigKey, { path: '/', sameSite: 'Strict' })
          toast.success('Slack connected successfully')
        }
      }
    })
  }

  return (
    <RolesContextProvider>
      <Grid container item spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: '5px 0' }}>Slack</h3>

              {isSlackConnected ? (
                <Button>Connected</Button>
              ) : (
                <Button variant='contained' onClick={handleAddSlack}>
                  Connect
                </Button>
              )}
            </CardContent>

            <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setIsMessageModal(true)}>Send Message</Button>
            </CardContent>
          </Card>

          <SendMessageModal open={isMessageModal} handleClose={() => setIsMessageModal(false)} />
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
