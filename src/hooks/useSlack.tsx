import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { NangoContext } from 'src/context/NangoContext'

type SlackChannel = {
  id: string
  name: string
}

export const useSlack = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const { connectionId } = useContext(NangoContext)

  const getChannels = async () => {
    if (!connectionId) return

    try {
      setIsLoading(true)
      const resp = await axios.post('/api/nango/slack/get_channels', {
        connectionId
      })
      setChannels(resp.data.channels.records)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (channel: string, text: string) => {
    if (!connectionId) return

    try {
      setIsLoading(true)
      const resp = await axios.post('/api/nango/slack/send_message', {
        connectionId,
        channel,
        text
      })

      if (resp.data.ok) {
        toast.success(resp.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getChannels()
  }, [])

  return {
    isLoading,
    channels,
    sendMessage
  }
}
