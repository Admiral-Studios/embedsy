import { Button, Dialog, DialogActions, DialogTitle, styled } from '@mui/material'
import React from 'react'

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    width: '80%',
    maxHeight: 435
  }
})

const StyledDialogActions = styled(DialogActions, {
  shouldForwardProp: prop => prop !== 'direction'
})<{ direction: 'row' | 'column' }>(({ direction }) => ({
  flexDirection: direction,
  gap: 12,
  '& > button':
    direction === 'column'
      ? {
          width: '100%',
          marginLeft: '0px !important'
        }
      : {}
}))

type Props = {
  open: boolean
  title?: string
  onClose: () => void
  onHandleConfirm: () => void
  onHandleSecondaryConfirm?: () => void
  confirmLabel?: string
  secondaryConfirmLabel?: string
  buttonVariant?: 'contained' | 'outlined'
  direction?: 'row' | 'column'
}

const ConfirmationDialog = ({
  open,
  title,
  onClose,
  onHandleConfirm,
  onHandleSecondaryConfirm,
  confirmLabel = 'Ok',
  secondaryConfirmLabel = 'Confirm',
  buttonVariant = 'outlined',
  direction = 'row'
}: Props) => {
  return (
    <StyledDialog maxWidth='xs' open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <StyledDialogActions direction={direction}>
        {direction === 'column' ? (
          <>
            <Button onClick={onHandleConfirm} variant={buttonVariant}>
              {confirmLabel}
            </Button>

            {onHandleSecondaryConfirm && (
              <Button onClick={onHandleSecondaryConfirm} variant={buttonVariant}>
                {secondaryConfirmLabel}
              </Button>
            )}

            <Button onClick={onClose}>Cancel</Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>

            {onHandleSecondaryConfirm && (
              <Button onClick={onHandleSecondaryConfirm} variant={buttonVariant}>
                {secondaryConfirmLabel}
              </Button>
            )}

            <Button onClick={onHandleConfirm} variant={buttonVariant}>
              {confirmLabel}
            </Button>
          </>
        )}
      </StyledDialogActions>
    </StyledDialog>
  )
}

export default ConfirmationDialog
