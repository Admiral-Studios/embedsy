import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import React from 'react'
import Icon from 'src/@core/components/icon'
import { createDownloadLink } from 'src/utils/createDownloadLink'

type Props = {
  visualData: { url: any; visualName: string } | null
  setVisualData: (v: any) => void
}

const VisualModal = ({ visualData, setVisualData }: Props) => {
  const shareOnLinkedIn = () => {
    if (!visualData?.url) return alert('Image is still uploading...')
    const linkedInURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(visualData?.url)}`
    window.open(linkedInURL, '_blank')
  }

  // Share on Twitter
  const shareOnTwitter = () => {
    if (!visualData?.url) return alert('Image is still uploading...')
    const tweetText = encodeURIComponent('Check out this image!')
    const twitterURL = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(visualData?.url)}`
    window.open(twitterURL, '_blank')
  }

  return (
    <Dialog open={!!visualData} onClose={() => setVisualData(null)} maxWidth='md'>
      <DialogTitle>Exported Visual</DialogTitle>

      <DialogContent>
        {visualData?.url && <img src={visualData.url} alt='Exported Visual' style={{ width: '100%' }} />}
      </DialogContent>

      <DialogActions>
        <Button color='error' onClick={() => setVisualData(null)}>
          Close
        </Button>

        {visualData?.url && (
          <>
            <Button color='primary' onClick={() => createDownloadLink(visualData.url, `${visualData.visualName}.png`)}>
              Download PNG
            </Button>

            <Button color='info' onClick={shareOnLinkedIn} startIcon={<Icon icon='mdi:linkedin' />}>
              Share On LinkedIn
            </Button>

            <Button color='info' onClick={shareOnTwitter} startIcon={<Icon icon='mdi:twitter' />}>
              Share On Twitter
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default VisualModal
