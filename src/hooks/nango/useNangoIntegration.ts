import Nango from '@nangohq/frontend'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { NangoContext } from 'src/context/NangoContext'
import { NangoIntegration } from 'src/context/types'
import { useAuth } from '../useAuth'

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
      const connection = getConnectionByKey(providerConfigKey);

      if (connection?.connectionId) {
        const connectionId = connection?.connectionId
        const providerConfigKey = connection?.providerConfigKey

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
          providerConfigKey: null
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

  const connectIntegration = async (providerConfigKey : string) => {
    const sessionToken = await getSessionToken(providerConfigKey);
    if (!sessionToken) {
      toast.error(`${providerConfigKey} connection failed, please try again later`);

      return;
    }

    nango.openConnectUI({
      sessionToken,
      onEvent: async event => {
        if (event.type === 'connect') {
          const { connectionId, providerConfigKey } = event.payload;
          try {
            const { data } = await axios.post('/api/nango/connection/create', {
              userId: user?.id,
              connectionId,
              connectionUserId: 'test',
              connectionUserEmail: user?.email,
              providerConfigKey
            });

            if (!data.ok) throw new Error(data.message);

            setConnections((prevConnections) => [
              ...prevConnections,
              {
                connectionId,
                providerConfigKey
              }
            ]);
            toast.success(`${providerConfigKey} connected successfully`);
          } catch (error) {
            console.error(error);
            toast.error(`${providerConfigKey} connection failed, please try again later`);
          }
        }
      }
    });
  };

  const disconnectIntegration = async (providerConfigKey: string) => {
    try {
      const connection = getConnectionByKey(providerConfigKey)

      if (connection) {
        const connectionId = connection?.connectionId;

        const resp = await axios.delete('/api/nango/connection/delete', {
          data: {
            connectionId,
            providerConfigKey
          }
        });

        if (resp.data.ok) {
          setConnections(connections.filter(item => item.providerConfigKey !== providerConfigKey));
          toast.success(`${providerConfigKey} disconnected successfully`);
        }
      }
    } catch (error) {
      toast.error(`${providerConfigKey} disconnection failed, please try again later`);
    }
  };

  return {
    integrations,
    connectIntegration,
    disconnectIntegration
  }
}
