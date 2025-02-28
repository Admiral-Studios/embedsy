import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import CustomModal from '../CustomModal'
import { styled } from '@mui/material/styles'

const PreviewBoxStyled = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 250,
  overflowY: 'scroll',
  padding: theme.spacing(2, 0)
}))

const ActionBoxStyled = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  gap: theme.spacing(2),
  display: 'flex'
}))

type Props = {
  open: boolean
  isInactiveBeyondThreshold: boolean
  onAcknowledge: () => void
}

const InactivityWarningModal = ({ open, isInactiveBeyondThreshold, onAcknowledge }: Props) => (
  <CustomModal open={open} handleClose={onAcknowledge} title='Inactivity Warning'>
    <PreviewBoxStyled>
      <Typography>
        {isInactiveBeyondThreshold ? (
          <>
            You have been inactive a longer period of time & the capacity might have turned off if it was not in use.
            <br />
            <br />
            The capacity will auto-turn on if needed when you become active again.
          </>
        ) : (
          "You have been inactive for a while. The capacity will turn off soon if you don't remain active."
        )}
      </Typography>
    </PreviewBoxStyled>
    <ActionBoxStyled>
      <Button variant='contained' onClick={onAcknowledge}>
        Acknowledge
      </Button>
    </ActionBoxStyled>
  </CustomModal>
)

export default InactivityWarningModal
