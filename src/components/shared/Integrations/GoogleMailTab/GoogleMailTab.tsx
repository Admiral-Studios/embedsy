import { Box, Button, DialogActions } from '@mui/material'

interface GoogleMailTabProps {
  onClose: () => void
  sharedData: string | null
  setIsLoading: (isLoading: boolean) => void
}

const GoogleMailTab = ({ onClose, sharedData }: GoogleMailTabProps) => {
  console.log(sharedData)

  // const shareData = async () => {
  //   try {
  //     const connectionId = connections.find(c => c.providerConfigKey === selectedProvider)?.connectionId

  //     if (!connectionId) {
  //       throw new Error('Failed to find connection')
  //     }

  //     const res = await axios.post('/api/nango/share_data', {
  //       connectionId,
  //       provider: selectedProvider,
  //       body,
  //       actionName: selectedScript?.name
  //     })

  //     console.log(res)
  //   } catch (e) {
  //     console.error(e)
  //     toast.error('Failed to share data')
  //   } finally {
  //     onClose()
  //     setBody({})
  //     setSelectedProvider('')
  //     setSelectedScript(null)
  //   }
  // }

  return (
    <>
      <Box sx={{ p: 5 }}>GoogleMailTab</Box>

      <DialogActions>
        <Button color='error' onClick={onClose}>
          Close
        </Button>

        <Button variant='contained' color='primary'>
          Share
        </Button>
      </DialogActions>
    </>
  )
}

export default GoogleMailTab
