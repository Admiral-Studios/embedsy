import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'

import Nango from '@nangohq/frontend'

import { RolesContextProvider } from 'src/context/RolesContext'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import axios from 'axios'
import { Button, Card, CardContent } from '@mui/material'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'
import SendMessageModal from './_components/SendMessageModal'

const Integrations = () => {
  const [isMessageModal, setIsMessageModal] = useState(false)
  const nango = new Nango()
  const cookies = Cookies.get()
  const isSlackConnected = cookies?.providerConfigKey === 'slack' || cookies?.connectionId

  const getNangoSessionToken = async () => {
    try {
      const response = await axios.post('/api/nango/session_token', {
        connectionId: cookies?.connectionId,
        providerConfigKey: cookies?.providerConfigKey
      })

      if (response.status !== 200) {
        console.error(response)
        toast.error(response.data.message)

        return
      }

      return response.data.sessionToken
    } catch (error) {
      console.log(error)
      toast.error('Connection failed, please try again later')
    }
  }

  const handleAddSlack = async () => {
    nango.openConnectUI({
      sessionToken: await getNangoSessionToken(),
      onEvent: event => {
        if (event.type === 'connect') {
          Cookies.set('connectionId', event.payload.connectionId, { path: '/', sameSite: 'Strict' })
          Cookies.set('providerConfigKey', event.payload.providerConfigKey, { path: '/', sameSite: 'Strict' })
          toast.success('Slack connected successfully')
        }
      }
    })
  }

  useEffect(() => {
    getNangoSessionToken()
  }, [])

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
