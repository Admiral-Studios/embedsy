import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { NangoContext } from 'src/context/NangoContext'
import { SlackChannel, SlackUser } from 'src/types/apps/slackTypes'

export const useSlack = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [users, setUsers] = useState<SlackUser[]>([])
  const [owner, setOwner] = useState<SlackUser | null>(null)
  const { connectionId } = useContext(NangoContext)

  const getChannels = async () => {
    try {
      const resp = await axios.post('/api/nango/slack/get_channels', {
        connectionId
      })
      setChannels(resp.data.channels)
    } catch (error) {
      console.error(error)
    }
  }

  const getUsers = async () => {
    try {
      const resp = await axios.post('/api/nango/slack/get_users', {
        connectionId
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

  useEffect(() => {
    getContacts()
  }, [])

  return {
    isLoading,
    channels,
    users,
    sendMessage,
    owner
  }
}
