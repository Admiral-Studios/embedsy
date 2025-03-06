import React, { ReactNode } from 'react'
import { Box, Button } from '@mui/material'
import CustomModal from '../../../../../components/shared/CustomModal'
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
  onClose: () => void
  children: ReactNode
}

const WarningModal = ({ open, onClose, children }: Props) => (
  <CustomModal open={open} handleClose={onClose} title='Row Level Warning'>
    <PreviewBoxStyled>{children}</PreviewBoxStyled>
    <ActionBoxStyled>
      <Button variant='contained' onClick={onClose}>
        Close
      </Button>
    </ActionBoxStyled>
  </CustomModal>
)

export default WarningModal
