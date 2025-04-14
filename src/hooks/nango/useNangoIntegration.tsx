import Nango from '@nangohq/frontend'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { NangoContext } from 'src/context/NangoContext'
import { NangoConnection, NangoIntegration } from 'src/context/types'
import { useAuth } from '../useAuth'

export interface NangoConnectCredentials {
  oauth_client_id_override: string
  oauth_client_secret_override: string
}

export const useNangoIntegration = () => {
  const [integrations, setIntegrations] = useState<NangoIntegration[]>([])
  const { connections, setConnections, getConnectionByKey } = useContext(NangoContext)
  const nango = new Nango()
  const { user } = useAuth()

  const getIntegrations = async () => {
    try {
      const { data } = await axios.get('/api/nango/integrations')

      data.ok ? setIntegrations(data.integrations) : toast.error(data.message)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getIntegrations()
  }, [])

  const getSessionToken = async (providerConfigKey: string) => {
    try {
      const connection = getConnectionByKey(providerConfigKey)

      if (connection?.connectionId) {
        const connectionId = connection?.connectionId

        const response = await axios.post('/api/nango/session_token', {
          connectionId: connectionId || null,
          providerConfigKey: providerConfigKey || null
        })

        if (response.status !== 200) {
          throw new Error('Failed to retrieve session token')
        }

        return response.data.sessionToken
      } else {
        const response = await axios.post('/api/nango/session_token', {
          connectionId: null,
          providerConfigKey: providerConfigKey
        })

        if (response.status !== 200) {
          throw new Error('Failed to retrieve session token')
        }

        return response.data.sessionToken
      }
    } catch (error) {
      console.error(error)
      toast.error('Connection failed, please try again later')

      return null
    }
  }

  const saveConnectionToDB = async (connectionId: string, providerConfigKey: string) => {
    try {
      const { data } = await axios.post('/api/nango/connection/create', {
        userId: user?.id,
        connectionId,
        connectionUserId: 'test',
        connectionUserEmail: user?.email,
        providerConfigKey
      })

      if (!data.ok) throw new Error(data.message)

      setConnections((prevConnections: NangoConnection[]) => [
        ...prevConnections,
        {
          connectionId,
          providerConfigKey
        } as NangoConnection
      ])
      toast.success(`${providerConfigKey} connected successfully`)
    } catch (error) {
      console.error(error)
      toast.error(`${providerConfigKey} connection failed, please try again later`)
    }
  }

  const connectIntegration = async (providerConfigKey: string) => {
    console.log(providerConfigKey)
    const sessionToken = await getSessionToken(providerConfigKey)
    if (!sessionToken) {
      toast.error(`${providerConfigKey} connection failed, please try again later`)

      return
    }

    nango.openConnectUI({
      sessionToken,
      onEvent: async event => {
        if (event.type === 'connect') {
          const { connectionId, providerConfigKey } = event.payload
          saveConnectionToDB(connectionId, providerConfigKey)
        }
      }
    })
  }

  const connectIntegrationWithCredentials = async (
    providerConfigKey: string | null,
    credentials: NangoConnectCredentials
  ) => {
    if (!providerConfigKey) {
      toast.error('Connection failed, please try again later')

      return
    }

    const connectSessionToken = await getSessionToken(providerConfigKey)

    const nango = new Nango({ connectSessionToken })

    return await nango
      .auth(providerConfigKey, {
        credentials
      })
      .then(result => {
        const { connectionId, providerConfigKey } = result
        saveConnectionToDB(connectionId, providerConfigKey)

        toast.success(`${providerConfigKey} connected successfully`)

        return result
      })
      .catch(error => {
        toast.error(`${providerConfigKey} connection failed, please try again later`)
        console.error(error)
      })
  }
  const disconnectIntegration = async (providerConfigKey: string) => {
    try {
      const connection = getConnectionByKey(providerConfigKey)

      if (connection) {
        const connectionId = connection?.connectionId

        const resp = await axios.delete('/api/nango/connection/delete', {
          data: {
            connectionId,
            providerConfigKey
          }
        })

        if (resp.data.ok) {
          setConnections(connections.filter(item => item.providerConfigKey !== providerConfigKey))
          toast.success(`${providerConfigKey} disconnected successfully`)
        }
      }
    } catch (error) {
      toast.error(`${providerConfigKey} disconnection failed, please try again later`)
    }
  }

  return {
    integrations,
    connectIntegration,
    connectIntegrationWithCredentials,
    disconnectIntegration
  }
}
