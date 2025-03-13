import { createContext, useState, ReactNode, useEffect } from 'react'
import { NangoValuesType } from './types'
import toast from 'react-hot-toast'
import axios from 'axios'
import Cookies from 'js-cookie'

const defaultProvider: NangoValuesType = {
  sessionToken: '',
  connectionId: '',
  providerConfigKey: '',
  integrations: []
}

const NangoContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const NangoProvider = ({ children }: Props) => {
  const cookies = Cookies.get()
  const [sessionToken, setSessionToken] = useState(defaultProvider.sessionToken)
  const [connectionId, setConnectionId] = useState(defaultProvider.connectionId)
  const [providerConfigKey, setProviderConfigKey] = useState(defaultProvider.providerConfigKey)
  const [integrations, setIntegrations] = useState(defaultProvider.integrations)

  const getSessionToken = async () => {
    try {
      const response = await axios.post('/api/nango/session_token', {
        connectionId: cookies?.connectionId,
        providerConfigKey: cookies?.providerConfigKey
      })

      if (response.status !== 200) {
        console.error(response)

        return
      }
      setSessionToken(response.data.sessionToken)
      getIntegrations()
    } catch (error) {
      console.log(error)
      toast.error('Connection failed, please try again later')
    }
  }

  const getIntegrations = async () => {
    try {
      const response = await axios.get('/api/nango/get_integrations')
      setIntegrations(response.data.integrations)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getSessionToken()

    if (cookies?.connectionId) {
      setConnectionId(cookies.connectionId)
    }

    if (cookies?.providerConfigKey) {
      setProviderConfigKey(cookies.providerConfigKey)
    }
  }, [])

  const values = {
    sessionToken,
    connectionId,
    providerConfigKey,
    integrations
  }

  return <NangoContext.Provider value={values}>{children}</NangoContext.Provider>
}

export { NangoContext, NangoProvider }
