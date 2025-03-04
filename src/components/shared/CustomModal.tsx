import React, { ReactNode } from 'react'
import { Modal, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'

const ModalBoxStyled = styled(Box)<{ customWidth: number }>(({ theme, customWidth }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: customWidth,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[24],
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  outline: 'none'
}))

const TitleContainerStyled = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}))

type Props = {
  open: boolean
  handleClose: () => void
  title: string
  customWidth?: number
  children: ReactNode
}

const CustomModal = ({ open, handleClose, title, customWidth = 450, children }: Props) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='custom-modal-title'
      aria-describedby='custom-modal-description'
    >
      <ModalBoxStyled customWidth={customWidth}>
        <TitleContainerStyled>
          <Typography variant='h6' component='h2'>
            {title}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </TitleContainerStyled>
        <Typography id='custom-modal-description' sx={{ mt: 2 }}>
          {children}
        </Typography>
      </ModalBoxStyled>
    </Modal>
  )
}

export default CustomModal
