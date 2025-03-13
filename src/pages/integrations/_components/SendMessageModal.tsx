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
import { useState } from 'react'
import { useSlack } from 'src/hooks/useSlack'

interface SendMessageModalProps {
  open: boolean
  handleClose: () => void
}

const SendMessageModal = ({ open, handleClose }: SendMessageModalProps) => {
  const [text, setText] = useState('')
  const [activeChanelId, setActiveChannelId] = useState('')
  const { sendMessage, isLoading, channels } = useSlack()

  const handleSendMessage = async () => {
    await sendMessage(activeChanelId, text)
    handleClose()
  }

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
              value={text}
              onChange={e => setText(e.target.value)}
              id='outlined-basic'
              label='Message'
              variant='outlined'
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSendMessage}>Send</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  )
}

export default SendMessageModal
