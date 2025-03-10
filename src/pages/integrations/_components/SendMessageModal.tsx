import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type SlackChannel = {
  id: string
  name: string
}

interface SendMessageModalProps {
  open: boolean
  handleClose: () => void
}

const SendMessageModal = ({ open, handleClose }: SendMessageModalProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [channels, setChannels] = useState<SlackChannel[]>([])
  const [activeChanelId, setActiveChannelId] = useState('')
  const [message, setMessage] = useState('')
  const cookies = Cookies.get()

  const sendMessage = async () => {
    try {
      setIsLoading(true)
      const resp = await axios.post('/api/nango/slack/send_message', {
        connectionId: cookies?.connectionId,
        channel: activeChanelId,
        text: message
      })

      if (resp.data.ok) {
        handleClose()
        toast.success('Message sent successfully')
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
      handleClose()
    }
  }

  useEffect(() => {
    const getChannels = async () => {
      try {
        const resp = await axios.post('/api/nango/slack/get_channels', {
          connectionId: cookies?.connectionId
        })
        setChannels(resp.data.channels.records)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }

    getChannels()
  }, [])

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      {isLoading ? (
        <Box display='flex' justifyContent='center' alignItems='center' height='266px'>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <DialogTitle>Send Slack Message</DialogTitle>

          <DialogContent>
            <FormControl fullWidth>
              <InputLabel id='channel'>Channel</InputLabel>
              <Select
                labelId='channel'
                label='Channel'
                value={activeChanelId}
                onChange={e => setActiveChannelId(e.target.value)}
              >
                {channels?.length
                  ? channels?.map(channel => (
                      <MenuItem key={channel?.id} value={channel?.id}>
                        {channel?.name}
                      </MenuItem>
                    ))
                  : null}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin='dense'
              value={message}
              onChange={e => setMessage(e.target.value)}
              id='outlined-basic'
              label='Message'
              variant='outlined'
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={sendMessage}>Send</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

export default SendMessageModal
