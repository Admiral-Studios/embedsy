import React, { ReactNode } from 'react'
import { Modal, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'

const ModalBoxStyled = styled(Box)<{ customwidth: number }>(({ theme, customwidth }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: customwidth,
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
  customwidth?: number
  children: ReactNode
}

const CustomModal = ({ open, handleClose, title, customwidth = 450, children }: Props) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <ModalBoxStyled customwidth={customwidth}>
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
