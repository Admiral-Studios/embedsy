import { createContext, useState, ReactNode, useEffect } from 'react'
import { NangoConnection, NangoValuesType } from './types'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from 'src/hooks/useAuth'

const defaultProvider: NangoValuesType = {
  sessionToken: '',
  connectionId: '',
  providerConfigKey: 'slack',
  connections: [],
  setConnections: () => null,
  setConnectionId: () => null,
  setProviderConfigKey: () => null,
  getSessionToken: () => null
}

const NangoContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const NangoProvider = ({ children }: Props) => {
  const [sessionToken, setSessionToken] = useState(defaultProvider.sessionToken)
  const [connections, setConnections] = useState<NangoConnection[]>(defaultProvider.connections)
  const [connectionId, setConnectionId] = useState(defaultProvider.connectionId)
  const [providerConfigKey, setProviderConfigKey] = useState(defaultProvider.providerConfigKey)
  const { user } = useAuth()

  const getUserConnections = async () => {
    const { data } = await axios.get(`/api/nango/connection/get?userId=${user?.id}`)

    if (!data.ok) {
      return console.error('Nango connection failed')
    }

    const result = data.result.map((item: any) => ({
      providerConfigKey: item.provider_config_key,
      connectionId: item.connection_id
    }))

    setConnections(result)
  }

  const getSessionToken = async ({
    connectionId,
    providerConfigKey
  }: {
    connectionId: string | null
    providerConfigKey: string | null
  }) => {
    try {
      const response = await axios.post('/api/nango/session_token', {
        connectionId: connectionId || null,
        providerConfigKey: providerConfigKey || null
      })

      if (response.status !== 200) {
        console.error(response)

        throw new Error('Failed to retrieve session token')
      }
      setSessionToken(response.data.sessionToken)
    } catch (error) {
      console.error(error)
      toast.error('Connection failed, please try again later')
    }
  }

  useEffect(() => {
    if (user?.id) {
      getUserConnections()
    }
  }, [user])

  const values = {
    sessionToken,
    connections,
    setConnections,
    connectionId,
    providerConfigKey,
    setConnectionId,
    setProviderConfigKey,
    getSessionToken
  }

  return <NangoContext.Provider value={values}>{children}</NangoContext.Provider>
}

export { NangoContext, NangoProvider }
