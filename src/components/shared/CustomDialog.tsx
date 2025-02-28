import React, { ReactNode } from 'react'
import { IconButton, Dialog, DialogProps } from '@mui/material'
import Icon from 'src/@core/components/icon'

type Props = DialogProps & {
  handleClose: () => void
  children: ReactNode
}

const CustomDialog = ({ open, handleClose, children, ...props }: Props) => {
  return (
    <Dialog open={open} onClose={handleClose} {...props}>
      <IconButton sx={{ position: 'absolute', top: 6, right: 6 }} onClick={handleClose}>
        <Icon icon='material-symbols:close' />
      </IconButton>

      {children}
    </Dialog>
  )
}

export default CustomDialog
