import Nango from '@nangohq/frontend'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { NangoContext } from 'src/context/NangoContext'
import { NangoConnection } from 'src/context/types'
import { SlackChannel, SlackUser } from 'src/types/apps/slackTypes'
import { useAuth } from './useAuth'

export const useSlack = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [users, setUsers] = useState<SlackUser[]>([])
  const [owner, setOwner] = useState<SlackUser | null>(null)
  const { connectionId, setConnections, connections } = useContext(NangoContext)
  const { user } = useAuth()
  const nango = new Nango()
  const isSlackConnected = !!connections.find(item => item.providerConfigKey === 'slack')

  const getSessionToken = async () => {
    try {
      if (isSlackConnected) {
        const connection = connections.find(item => item.providerConfigKey === 'slack')
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

  const getChannels = async () => {
    try {
      const resp = await axios.post('/api/nango/slack/get_channels', {
        connectionId: connections.find(item => item.providerConfigKey === 'slack')?.connectionId
      })
      setChannels(resp.data.channels)
    } catch (error) {
      console.error(error)
    }
  }

  const getUsers = async () => {
    try {
      const resp = await axios.post('/api/nango/slack/get_users', {
        connectionId: connections.find(item => item.providerConfigKey === 'slack')?.connectionId
      })
      setUsers(resp.data.users)
      setOwner(resp.data.users.find((user: any) => user.is_owner) || null)
    } catch (error) {
      console.error(error)
    }
  }

  const getContacts = async () => {
    setIsLoading(true)
    await getChannels()
    await getUsers()
    setIsLoading(false)
  }

  const sendMessage = (channel: string, text: string) => {
    try {
      setIsLoading(true)

      return axios.post('/api/nango/slack/send_message', {
        connectionId,
        channel,
        text
      })
    } catch (error) {
      console.error(error)

      return null
    } finally {
      setIsLoading(false)
    }
  }

  const connectSlack = async () => {
    const sessionToken = await getSessionToken()

    nango.openConnectUI({
      sessionToken,
      onEvent: async event => {
        if (event.type === 'connect') {
          const { connectionId, providerConfigKey } = event.payload
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
            toast.success('Slack connected successfully')
          } catch (error) {
            console.error(error)
            toast.error('Slack connection failed, please try again later')
          }
        }
      }
    })
  }

  const disconnectSlack = async () => {
    try {
      const connection = connections.find(item => item.providerConfigKey === 'slack')

      if (connection) {
        const connectionId = connection?.connectionId
        const providerConfigKey = connection?.providerConfigKey

        const resp = await axios.delete('/api/nango/connection/delete', {
          data: {
            connectionId,
            providerConfigKey
          }
        })

        if (resp.data.ok) {
          setConnections(connections.filter(item => item.providerConfigKey !== 'slack'))
          toast.success('Slack disconnected successfully')
        }
      }
    } catch (error) {
      toast.error('Slack disconnection failed, please try again later')
    }
  }

  useEffect(() => {
    if (isSlackConnected) {
      getContacts()
    }
  }, [isSlackConnected])

  return {
    isSlackConnected,
    isLoading,
    channels,
    users,
    owner,
    sendMessage,
    connectSlack,
    disconnectSlack
  }
}
